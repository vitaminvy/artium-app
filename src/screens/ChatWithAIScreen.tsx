import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";

type AiMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: Date;
};

const STARTER_PROMPTS = [
  "Suggest artworks for a calm living room",
  "Help price a mixed media piece",
  "Write a short artist statement",
];

const initialMessages: AiMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: "Hi, I am Artium AI. Ask about artwork curation, pricing, collecting, or writing gallery copy.",
    createdAt: new Date(),
  },
];

const buildAssistantReply = (prompt: string) => {
  const text = prompt.toLowerCase();

  if (text.includes("price") || text.includes("pricing")) {
    return "Start with size, medium, condition, artist track record, and recent comparable sales. If you share those details, I can help structure a pricing range.";
  }

  if (text.includes("statement") || text.includes("copy")) {
    return "A strong statement usually keeps one clear idea, concrete material details, and a confident final line. Send me the artwork title, medium, and concept.";
  }

  if (text.includes("room") || text.includes("curation") || text.includes("suggest")) {
    return "For a calm room, choose pieces with soft contrast, balanced negative space, and one warmer accent. Keep scale generous enough that the work anchors the wall.";
  }

  return "I can help refine that. Share the artwork medium, size, style, budget, or the room context, and I will narrow the recommendation.";
};

export default function ChatWithAIScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<AiMessage>>(null);
  const timersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const [messages, setMessages] = useState<AiMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const listBottomPadding = useMemo(
    () => Math.max(insets.bottom + 112, 132),
    [insets.bottom]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
    timersRef.current.push(timer);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [messages.length, isThinking]);

  const sendPrompt = useCallback((value?: string) => {
    const prompt = (value ?? inputText).trim();
    if (!prompt || isThinking) return;

    const userMessage: AiMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: prompt,
      createdAt: new Date(),
    };

    setInputText("");
    setMessages((current) => [...current, userMessage]);
    setIsThinking(true);

    const timer = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: buildAssistantReply(prompt),
          createdAt: new Date(),
        },
      ]);
      setIsThinking(false);
    }, 650);
    timersRef.current.push(timer);
  }, [inputText, isThinking]);

  const renderMessage = ({ item }: { item: AiMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isUser ? "flex-end" : "flex-start" },
        ]}
      >
        {!isUser ? (
          <View style={styles.assistantAvatar}>
            <Ionicons name="sparkles" size={16} color="#0F172A" />
          </View>
        ) : null}

        <View style={[styles.messageStack, isUser && styles.userMessageStack]}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {dayjs(item.createdAt).format("h:mm A")}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 8}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerIconButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>

        <View style={styles.headerAvatar}>
          <Ionicons name="sparkles" size={20} color="#0F172A" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Artium AI</Text>
          <Text style={styles.headerSubtitle}>
            {isThinking ? "Thinking..." : "Online"}
          </Text>
        </View>

        <Pressable style={styles.headerIconButton} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#0F172A" />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: listBottomPadding },
        ]}
        ListFooterComponent={
          <>
            {isThinking ? (
              <View style={styles.thinkingRow}>
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={16} color="#0F172A" />
                </View>
                <View style={styles.thinkingBubble}>
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                  <View style={styles.dot} />
                </View>
              </View>
            ) : null}

            {messages.length <= 1 ? (
              <View style={styles.promptPanel}>
                <Text style={styles.promptTitle}>Try asking</Text>
                {STARTER_PROMPTS.map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() => sendPrompt(prompt)}
                    style={styles.promptChip}
                  >
                    <Text style={styles.promptChipText}>{prompt}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#0F172A" />
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        }
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <View
        style={[
          styles.composerContainer,
          { paddingBottom: Math.max(insets.bottom, 10) },
        ]}
      >
        <View style={styles.composer}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Artium AI"
            placeholderTextColor="#94A3B8"
            multiline
            style={styles.input}
          />
          <Pressable
            onPress={() => sendPrompt()}
            disabled={!inputText.trim() || isThinking}
            style={[
              styles.sendButton,
              (!inputText.trim() || isThinking) && styles.sendButtonDisabled,
            ]}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    minHeight: 72,
    paddingBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D9F99D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BEF264",
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: "#16A34A",
  },
  messagesList: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  assistantAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ECFCCB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D9F99D",
  },
  messageStack: {
    maxWidth: "78%",
  },
  userMessageStack: {
    alignItems: "flex-end",
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  userBubble: {
    backgroundColor: "#0F172A",
    borderBottomRightRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: "#0F172A",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  messageTime: {
    marginTop: 4,
    marginHorizontal: 6,
    fontSize: 11,
    color: "#94A3B8",
  },
  userMessageTime: {
    textAlign: "right",
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  thinkingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#64748B",
  },
  promptPanel: {
    marginTop: 8,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
  },
  promptTitle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: "#64748B",
    textTransform: "uppercase",
  },
  promptChip: {
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  promptChipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  composerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  composer: {
    minHeight: 46,
    maxHeight: 118,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingLeft: 14,
    paddingRight: 5,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    maxHeight: 96,
    paddingTop: Platform.OS === "ios" ? 8 : 6,
    paddingBottom: Platform.OS === "ios" ? 8 : 6,
    fontSize: 15,
    lineHeight: 20,
    color: "#0F172A",
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
});

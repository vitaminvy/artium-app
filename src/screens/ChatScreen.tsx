import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  Platform,
  Image,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import { useChat } from "@/domains/chat/hooks/useChat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import dayjs from "dayjs";

// Message type for our custom implementation
interface Message {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name?: string;
    avatar?: string;
  };
}

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Params passed from navigation
  const { chatId, otherUserName, otherUserAvatar } = route.params as {
    chatId: string;
    otherUserName?: string;
    otherUserAvatar?: string;
  };

  const { messages, onSend, currentUser } = useChat(chatId);

  // Input state
  const [inputText, setInputText] = useState("");

  // Handle send message
  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const newMessage = {
      _id: Date.now().toString(),
      text: messageText,
      createdAt: new Date(),
      user: {
        _id: currentUser?.uid || "",
        name: currentUser?.displayName || "User",
        avatar: currentUser?.photoURL || undefined,
      },
    };

    onSend([newMessage] as any);
    if (!text) setInputText("");
  };

  // Handle send like emoji
  const handleSendLike = () => {
    handleSend("👍");
  };

  // Scroll to bottom when new message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Render message bubble - Messenger style
  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user._id === currentUser?.uid;

    return (
      <View
        style={[
          styles.messageRow,
          { justifyContent: isMe ? "flex-end" : "flex-start" },
        ]}
      >
        {/* Avatar for other user */}
        {!isMe && (
          <Image
            source={{
              uri:
                item.user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  otherUserName || "U"
                )}&background=E2E8F0&color=64748B&size=64`,
            }}
            style={styles.messageAvatar}
          />
        )}

        <View style={{ maxWidth: "70%" }}>
          {/* Message Bubble */}
          <View
            style={[
              styles.messageBubble,
              isMe ? styles.bubbleMe : styles.bubbleOther,
            ]}
          >
            <Text style={[styles.messageText, { color: isMe ? "#FFF" : "#050505" }]}>
              {item.text}
            </Text>
          </View>

          {/* Time */}
          <Text style={[styles.messageTime, { textAlign: isMe ? "right" : "left" }]}>
            {dayjs(item.createdAt).format("h:mm A")}
          </Text>
        </View>
      </View>
    );
  };

  // Day separator
  const renderDaySeparator = () => (
    <View style={styles.daySeparator}>
      <View style={styles.daySeparatorBadge}>
        <Text style={styles.daySeparatorText}>Today</Text>
      </View>
    </View>
  );

  if (!chatId || !currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084FF" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* Messenger-style Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          <Pressable onPress={() => navigation.goBack()} style={styles.headerButton} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color="#050505" />
          </Pressable>

          {/* User Info */}
          <Pressable style={styles.headerUserInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    otherUserAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      otherUserName || "User"
                    )}&background=0084FF&color=fff&size=96`,
                }}
                style={styles.headerAvatar}
              />
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherUserName || "Chat"}
              </Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          </Pressable>

          {/* Action Buttons */}
          <View style={styles.headerActions}>
            <Pressable style={styles.headerButton}>
              <Ionicons name="call" size={22} color="#0084FF" />
            </Pressable>
            <Pressable style={styles.headerButton}>
              <Ionicons name="videocam" size={24} color="#0084FF" />
            </Pressable>
            <Pressable style={styles.headerButton}>
              <Ionicons name="ellipsis-vertical" size={20} color="#050505" />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages as Message[]}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListFooterComponent={messages.length > 0 ? renderDaySeparator : null}
      />

      {/* Messenger-style Input Bar */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.inputRow}>
          {/* Left Actions - Collapsed into one menu button when input is focused */}
          <View style={styles.inputActions}>
            {/* Plus/Menu button */}
            <Pressable style={styles.inputActionButton}>
              <View style={styles.plusButton}>
                <Ionicons name="add" size={22} color="#FFFFFF" />
              </View>
            </Pressable>

            {/* Camera button */}
            <Pressable style={styles.inputActionButton}>
              <Ionicons name="camera" size={22} color="#0084FF" />
            </Pressable>

            {/* Image/Gallery button */}
            <Pressable style={styles.inputActionButton}>
              <Ionicons name="images" size={22} color="#0084FF" />
            </Pressable>

            {/* Voice/Mic button */}
            <Pressable style={styles.inputActionButton}>
              <Ionicons name="mic" size={22} color="#0084FF" />
            </Pressable>
          </View>

          {/* Text Input */}
          <View style={styles.textInputContainer}>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Aa"
              placeholderTextColor="#65676B"
              multiline
              style={styles.textInput}
            />
            {/* Emoji button inside input */}
            <Pressable style={styles.emojiButton}>
              <Ionicons name="happy-outline" size={22} color="#0084FF" />
            </Pressable>
          </View>

          {/* Send / Like button */}
          <Pressable
            onPress={inputText.trim() ? () => handleSend() : handleSendLike}
            style={styles.sendButtonContainer}
          >
            {inputText.trim() ? (
              <View style={styles.sendButtonActive}>
                <Ionicons name="send" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </View>
            ) : (
              <MaterialCommunityIcons name="thumb-up" size={26} color="#0084FF" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#65676B",
  },

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EB",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 4,
  },
  avatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4E6EB",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#31A24C",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#050505",
  },
  headerStatus: {
    fontSize: 12,
    color: "#31A24C",
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  // Messages
  messagesList: {
    paddingVertical: 8,
  },
  messageRow: {
    flexDirection: "row",
    marginVertical: 2,
    marginHorizontal: 12,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: "#0084FF",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#E4E6EB",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    color: "#65676B",
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 4,
  },
  daySeparator: {
    alignItems: "center",
    marginVertical: 16,
  },
  daySeparatorBadge: {
    backgroundColor: "#E4E6EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  daySeparatorText: {
    color: "#65676B",
    fontSize: 12,
    fontWeight: "600",
  },

  // Input
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E4E6EB",
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputActionButton: {
    width: 34,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  plusButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: "#F0F2F5",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    minHeight: 36,
    maxHeight: 100,
    marginHorizontal: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#050505",
    paddingHorizontal: 12,
    paddingTop: Platform.OS === "ios" ? 8 : 6,
    paddingBottom: Platform.OS === "ios" ? 8 : 6,
    maxHeight: 100,
  },
  emojiButton: {
    width: 34,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  sendButtonContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0084FF",
    alignItems: "center",
    justifyContent: "center",
  },
});

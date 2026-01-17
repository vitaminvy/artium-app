import React from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";
import {
  GiftedChat,
  Bubble,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import { useChat } from "@/domains/chat/hooks/useChat";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Params passed from navigation
  const { chatId, otherUserName } = route.params as {
    chatId: string;
    otherUserName?: string;
  };

  const { messages, onSend, currentUser } = useChat(chatId);

  const renderInputToolbar = (props: any) => (
    <InputToolbar
      {...props}
      containerStyle={{
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
      primaryStyle={{ alignItems: "center" }}
    />
  );

  const renderSend = (props: any) => {
    const hasText = Boolean(props.text?.trim());
    return (
      <Send {...props} disabled={!hasText}>
        <View
          className={`h-9 w-9 items-center justify-center rounded-full ${
            hasText ? "bg-[#0B73FF]" : "bg-slate-200"
          }`}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={hasText ? "#FFFFFF" : "#94A3B8"}
          />
        </View>
      </Send>
    );
  };

  if (!chatId || !currentUser) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center border-b border-slate-100 px-4 py-3 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="mr-3 h-9 w-9 items-center justify-center"
          hitSlop={8}
        >
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
        <View>
          <Text className="text-base font-semibold text-slate-900">
            {otherUserName || "Chat"}
          </Text>
        </View>
      </View>

      {/* Gifted Chat UI */}
      <GiftedChat
        messages={messages as IMessage[]}
        onSend={(messages) => onSend(messages as any)}
        user={{
          _id: currentUser.uid,
          name: currentUser.displayName || "User",
          avatar: currentUser.photoURL || undefined,
        }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: "#0B73FF" },
              left: { backgroundColor: "#F1F5F9" },
            }}
            textStyle={{
              right: { color: "#FFFFFF" },
              left: { color: "#0F172A" },
            }}
          />
        )}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        textInputStyle={{
          backgroundColor: "#F8FAFC",
          borderWidth: 1,
          borderColor: "#E2E8F0",
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 8,
          color: "#0F172A",
          fontSize: 14,
          marginLeft: 0,
          marginRight: 6,
        }}
        textInputProps={{
          placeholderTextColor: "#94A3B8",
        }}
        showUserAvatar
        showAvatarForEveryMessage={false}
        alwaysShowSend
        scrollToBottom
        placeholder="Type a message..."
        bottomOffset={insets.bottom}
      />
    </View>
  );
}

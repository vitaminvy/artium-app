// src/screens/ChatScreen.tsx
import React from "react";
import { View, Text } from "react-native";

export default function ChatScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-indigo-50">
      <Text className="text-3xl font-bold text-indigo-700">Chat</Text>
      <Text className="text-gray-700 mt-2">Chat Screen</Text>
    </View>
  );
}
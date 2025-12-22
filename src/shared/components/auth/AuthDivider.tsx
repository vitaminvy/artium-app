import React from "react";
import { Text, View } from "react-native";

export default function AuthDivider() {
  return (
    <View className="flex-row items-center my-8">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="mx-3 text-gray-400 text-xs uppercase tracking-[0.25em]">
        OR
      </Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  );
}

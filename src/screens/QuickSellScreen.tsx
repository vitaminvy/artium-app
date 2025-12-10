// Quick Sell Screen
// src/screens/QuickSellScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";

export default function QuickSellScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-blue-50">
      <Text className="text-3xl font-bold text-blue-700">Quick Sell</Text>
      <Text className="text-gray-700 mt-2">Tạo bài đăng bán nhanh</Text>

      <Pressable className="mt-6 rounded-2xl bg-blue-600 px-6 py-3 active:opacity-90">
        <Text className="text-white font-semibold">Bắt đầu bán</Text>
      </Pressable>
    </View>
  );
}

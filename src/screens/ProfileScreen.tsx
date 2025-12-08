// User Profile Screen
// src/screens/ProfileScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-orange-50">
      <Text className="text-3xl font-bold text-orange-700">Profile</Text>
      <Text className="text-gray-700 mt-2">Profile Screen</Text>
    </View>
  );
}
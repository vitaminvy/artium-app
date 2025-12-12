// Feed Screen
// src/screens/FeedScreen.tsx
import React from "react";
import { View, Text } from "react-native";
import ScreenHeader from "../shared/components/ScreenHeader";

export default function FeedScreen() {
  return (
    <View className="flex-1 bg-sky-50">
      <ScreenHeader
        title="Feed"
        badgeLabel="Blog"
        actionType="notifications"
        onPressAction={() => console.log("Open notifications")}
        underlineSource={require("../../assets/headers/underline-home.svg")}
      />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-sky-700">Feed</Text>
        <Text className="text-gray-700 mt-2">My Feed Screen</Text>
      </View>
    </View>
  );
}

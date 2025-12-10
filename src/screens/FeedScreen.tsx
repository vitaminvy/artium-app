import React from "react";
import { Text, View } from "react-native";

export default function FeedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-black">My Feed</Text>
      <Text className="mt-2 text-base text-gray-600">
        Personalized updates will appear here.
      </Text>
    </View>
  );
}

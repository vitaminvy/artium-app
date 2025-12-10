import React from "react";
import { Pressable, Text, View } from "react-native";

export default function QuickSellScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-3xl font-bold text-[#347CFF]">Quick Sell</Text>
      <Text className="mt-2 text-center text-base text-gray-600">
        List your artwork in seconds and start selling instantly.
      </Text>
      <Pressable className="mt-6 rounded-full bg-[#347CFF] px-6 py-3">
        <Text className="text-base font-semibold text-white">Start Selling</Text>
      </Pressable>
    </View>
  );
}

// Main Home/Feed Screen
// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-3xl font-bold text-blue-600">ARTIUM</Text>
      <Text className="text-lg mt-2 text-gray-700">Home Screen</Text>

      <Pressable
        onPress={() => navigation.navigate("Discover" as never)}
        className="mt-6 px-6 py-3 bg-blue-500 rounded-xl"
      >
        <Text className="text-white font-semibold">Go to Discover</Text>
      </Pressable>
    </View>
  );
}
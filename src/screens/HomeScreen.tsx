// Main Home/Feed Screen
// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Home"
        badgeLabel="Blog"
        actionType="menu"
        onPressAction={() => console.log("Open menu")}
      />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-slate-900">ARTIUM</Text>
        <Text className="text-lg mt-2 text-gray-700">Home Screen</Text>

        <Pressable
          onPress={() => navigation.navigate("Discover" as never)}
          className="mt-6 px-6 py-3 bg-slate-900 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Discover</Text>
        </Pressable>
      </View>
    </View>
  );
}

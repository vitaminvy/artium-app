// Main Home/Feed Screen
// src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, Pressable, DevSettings } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { tokenStorage } from "../domains/auth/services/tokenStorage";

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

      <Pressable
        onPress={async () => {
          await tokenStorage.remove();
          // Reload JS to re-run auth bootstrap and show Welcome
          DevSettings.reload();
        }}
        className="mt-4 px-4 py-2 rounded-lg border border-slate-300"
      >
        <Text className="text-slate-700 text-sm">Clear token & reload</Text>
      </Pressable>
    </View>
  );
}

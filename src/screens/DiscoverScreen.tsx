// Discovery/Search Screen
// src/screens/DiscoverScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";

export default function DiscoverScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-green-50">
      <ScreenHeader
        title="Discover"
        badgeLabel="Blog"
        actionType="search"
        onPressAction={() => console.log("Open search")}
      />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-green-700">Discover</Text>
        <Text className="mt-2 text-gray-700">Discover Screen</Text>

        <Pressable
          onPress={() =>
            (navigation.navigate as any)("ArtworkDetail", { id: "123" })
          }
          className="mt-6 px-6 py-3 bg-green-600 rounded-xl"
        >
          <Text className="text-white font-semibold">Open Artwork Detail</Text>
        </Pressable>
      </View>
    </View>
  );
}

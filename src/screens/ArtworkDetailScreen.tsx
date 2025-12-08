// Detailed view for specific Artwork
// src/screens/ArtworkDetailScreen.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function ArtworkDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();

  return (
    <View className="flex-1 items-center justify-center bg-purple-50">
      <Text className="text-2xl font-bold text-purple-700">
        Artwork Detail
      </Text>

      <Text className="mt-2 text-gray-700">
        Artwork ID: {route?.params?.id}
      </Text>

      <Pressable
        onPress={() => navigation.goBack()}
        className="mt-6 px-6 py-3 bg-purple-600 rounded-xl"
      >
        <Text className="text-white font-semibold">Go Back</Text>
      </Pressable>
    </View>
  );
}
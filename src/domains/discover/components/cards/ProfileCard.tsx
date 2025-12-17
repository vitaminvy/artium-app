import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ArtistProfile } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

export default function ProfileCard({ item }: { item: ArtistProfile }) {
  return (
    <View
      className="flex-1 rounded-3xl bg-white border border-slate-100 px-4 py-5 items-center"
      style={cardShadow}
    >
      <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
        <Image source={{ uri: item.avatar }} className="h-full w-full" />
      </View>
      <Text className="mt-3 text-base font-semibold text-slate-900 text-center">
        {item.name}
      </Text>
      <View className="flex-row items-center gap-1">
        {item.verified && (
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
        )}
        {item.title ? (
          <Text className="text-xs text-slate-500">{item.title}</Text>
        ) : null}
      </View>

      <Pressable className="mt-4 px-4 py-2 rounded-full bg-slate-900 active:opacity-90">
        <Text className="text-xs font-semibold text-white">Follow</Text>
      </Pressable>
    </View>
  );
}

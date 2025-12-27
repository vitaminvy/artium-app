import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Artwork } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

export default function MomentCard({
  item,
  onPress,
}: {
  item: Artwork;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full"
        style={{ aspectRatio: 3 / 4 }}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
      <View className="px-4 py-4 gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
              {item.artistAvatar ? (
                <Image
                  source={{ uri: item.artistAvatar }}
                  className="h-full w-full"
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={0}
                />
              ) : null}
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-semibold text-slate-800">
                {item.artist}
              </Text>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable className="flex-row items-center gap-1 active:opacity-80">
              <Ionicons name="heart-outline" size={18} color="#0F172A" />
              <Text className="text-xs font-semibold text-slate-700">120</Text>
            </Pressable>
            <Pressable className="flex-row items-center gap-1 active:opacity-80">
              <Ionicons name="chatbubble-outline" size={18} color="#0F172A" />
              <Text className="text-xs font-semibold text-slate-700">32</Text>
            </Pressable>
          </View>
        </View>
        <Text className="text-sm text-slate-600">{item.title}</Text>
      </View>
    </Pressable>
  );
}

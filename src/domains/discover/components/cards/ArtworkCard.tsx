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

const cardContainer = {
  borderRadius: 28,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  overflow: "hidden" as const,
};

const glassPillStyle = {
  backgroundColor: "rgba(255,255,255,0.85)",
  borderColor: "rgba(255,255,255,0.55)",
  borderWidth: 1,
  shadowColor: "#0F172A",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
};

export default function ArtworkCard({
  item,
  onPress,
}: {
  item: Artwork;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 bg-white overflow-hidden"
      style={[cardShadow, cardContainer]}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full"
          style={{ aspectRatio: 3 / 4, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
        {item.isTrending ? (
          <View className="absolute bottom-3 left-3">
            <View
              className="flex-row items-center gap-1 rounded-full px-3 py-1"
              style={glassPillStyle}
            >
              <Ionicons name="flame" size={14} color="#F97316" />
              <Text className="text-[11px] font-semibold uppercase text-[#F97316]">
                Trending
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="px-4 py-4 bg-white rounded-b-[28px] justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden">
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
          <Text className="text-[13px] text-slate-600 font-medium">
            {item.artist}
          </Text>
        </View>

        <Text className="text-[18px] font-bold text-slate-900">
          {item.title}
        </Text>

        <View className="gap-1.5">
          {item.location ? (
            <Text className="text-sm text-slate-400">{item.location}</Text>
          ) : null}
          {item.price ? (
            <View
              className="self-start rounded-full px-3 py-1"
              style={glassPillStyle}
            >
              <Text className="text-[13px] font-semibold text-[#2563EB] tracking-tight">
                {item.price}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

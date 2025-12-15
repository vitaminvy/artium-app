import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Artwork } from "../../types";
import { Badge, Pill } from "../ui/DiscoverShared";

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
          resizeMode="cover"
        />
        {item.isTrending && (
          <View
            className="absolute bottom-3 left-3 flex-row items-center gap-1 rounded-full px-3 py-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.32)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.55)",
            }}
          >
            <Ionicons name="flame" size={14} color="#EA580C" />
            <Text className="text-[11px] font-semibold text-[#EA580C]">
              TRENDING
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 py-4 gap-3 bg-white rounded-b-[28px]">
        <View className="flex-row items-center gap-3">
          <View className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden">
            {item.artistAvatar ? (
              <Image
                source={{ uri: item.artistAvatar }}
                className="h-full w-full"
              />
            ) : null}
          </View>
          <Text className="text-sm text-slate-600 font-medium">
            {item.artist}
          </Text>
        </View>

        <Text className="text-[18px] font-bold text-slate-900">
          {item.title}
        </Text>

        <View className="flex-row items-center gap-3 flex-wrap">
          {item.price ? <Pill label={item.price} color="#2563EB" /> : null}
          {item.location ? (
            <Text className="text-sm text-slate-400">{item.location}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

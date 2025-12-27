import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { Artwork } from "../../../discover/types";

const cardShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

type SimilarCardProps = {
  item: Artwork;
  onPress: () => void;
};

export default function SimilarCard({ item, onPress }: SimilarCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-48 rounded-2xl border border-slate-200 bg-white"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="h-44 w-full rounded-t-2xl"
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
      <View className="px-3 py-3 gap-1">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden">
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
          <Text
            className="text-xs font-semibold text-slate-700"
            numberOfLines={1}
          >
            {item.artist}
          </Text>
        </View>
        <Text
          className="text-sm font-semibold text-slate-900"
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="h-2.5 w-2.5 rounded-full bg-[#0B73FF]" />
          <Text className="text-sm font-semibold text-slate-900">
            {item.price ?? "$500"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ArtworkCardItem = {
  id: string;
  title: string;
  image: string;
  artist: {
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  price?: string;
};

type Props = {
  item: ArtworkCardItem;
  onPress?: () => void;
};

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 6,
};

export default function ArtworkCard({ item, onPress }: Props) {
  const initials = item.artist.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-90"
      style={cardShadow}
    >
      <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        <View className="relative bg-slate-200" style={{ aspectRatio: 3 / 4 }}>
          <Image
            source={{ uri: item.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="px-4 py-3">
          <View className="flex-row items-center gap-2 mb-2">
            <View className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden items-center justify-center">
              {item.artist.avatar ? (
                <Image
                  source={{ uri: item.artist.avatar }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-xs font-semibold text-slate-700">
                  {initials}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-1" style={{ flexShrink: 1 }}>
              <Text
                className="text-sm font-semibold text-slate-900"
                numberOfLines={1}
              >
                {item.artist.name}
              </Text>
              {item.artist.verified && (
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              )}
            </View>
          </View>

          <Text
            className="text-base font-semibold text-slate-800"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>

          {item.price ? (
            <View className="flex-row items-center gap-2 mt-3 px-3 py-1.5 rounded-full border border-slate-200 bg-white self-start">
              <View className="h-2 w-2 rounded-full bg-[#2D7CF6]" />
              <Text className="text-sm font-semibold text-slate-900">
                {item.price}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

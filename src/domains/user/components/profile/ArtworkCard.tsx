import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type ArtworkCardItem = {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  image: string;
  price?: string;
};

type Props = {
  item: ArtworkCardItem;
  onPress?: () => void;
};

export default function ArtworkCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 overflow-hidden"
    >
      {/* Artwork Image */}
      <View className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200">
        <Image
          source={{ uri: item.image }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>

      {/* Artwork Info */}
      <View className="mt-3 px-1">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-2">
            <Text
              className="text-sm font-semibold text-slate-900"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
              {item.artist}
            </Text>
          </View>

          {item.price && (
            <View className="bg-blue-500 rounded-full px-2 py-1">
              <Text className="text-xs font-semibold text-white">
                {item.price}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import type { BlogArticle } from "../types";

type Props = {
  item: BlogArticle;
  onPress?: (item: BlogArticle) => void;
  width?: number;
};

export default function BlogHorizontalCard({ item, onPress, width }: Props) {
  const cardWidth = width ?? 270;
  const cardHeight = 220;
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="mr-4 rounded-[22px] border border-slate-100 bg-white"
      style={{ width: cardWidth, height: cardHeight, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 6 }, elevation: 3 }}
      onPress={() => onPress?.(item)}
    >
      <View className="mx-3 mt-3 h-[136px] overflow-hidden rounded-2xl bg-slate-100">
        <Image
          source={{ uri: item.coverImage }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        <View
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        />
        <View className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1">
          <Text className="text-[11px] font-semibold text-slate-900 uppercase">
            {item.tag ?? "Blog"}
          </Text>
        </View>
      </View>

      <View className="flex-1 px-4 py-4 justify-center" style={{ rowGap: 10 }}>
        <Text className="text-[15px] font-semibold text-slate-900 leading-5" numberOfLines={2}>
          {item.title}
        </Text>

        <View className="flex-row items-center" style={{ columnGap: 6 }}>
          <View className="h-7 w-7 overflow-hidden rounded-full bg-slate-200">
            <Image
              source={{ uri: item.authorAvatar }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          </View>
          <Text className="text-[12px] font-semibold text-slate-700">
            {item.authorName}
          </Text>
          <Dot />
          <Text className="text-[11px] text-slate-500">
            {new Date(item.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </Text>
          <Dot />
          <Text className="text-[11px] text-slate-500">
            {item.readTimeMinutes} mins
          </Text>
        </View>
      </View>
    </Container>
  );
}

function Dot() {
  return <View className="h-1 w-1 rounded-full bg-slate-300" />;
}

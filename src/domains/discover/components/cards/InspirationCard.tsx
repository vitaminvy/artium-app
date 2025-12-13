import React from "react";
import { View, Text, Image } from "react-native";
import { InspirationArticle } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

export default function InspirationCard({ item }: { item: InspirationArticle }) {
  const date = new Date(item.publishedAt);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="h-44 w-full"
        resizeMode="cover"
      />
      <View className="px-4 py-4 gap-2">
        <Text className="text-xs font-semibold text-slate-500">
          {item.category}
        </Text>
        <Text className="text-base font-semibold text-slate-900">
          {item.title}
        </Text>
        <Text className="text-xs text-slate-500">
          {item.author} • {dateLabel} • {item.readTime}
        </Text>
      </View>
    </View>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import type { BlogArticle } from "../types";
import { navigateToUserProfile } from "../../../shared/utils/navigateToUserProfile";

type Props = {
  item: BlogArticle;
  onPress?: (item: BlogArticle) => void;
};

export default function BlogArticleCard({ item, onPress }: Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="mb-6 overflow-hidden rounded-[26px] border border-slate-100 bg-white"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 10 },
        elevation: 4,
      }}
      onPress={() => onPress?.(item)}
    >
      <View className="h-[230px] w-full bg-slate-100 overflow-hidden">
        <Image
          source={{ uri: item.coverImage }}
          style={{ width: "100%", height: "100%", transform: [{ scale: 1.35 }] }}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={0}
        />
        <View
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
        />
        <View className="absolute left-4 top-4 flex-row items-center gap-2">
          <Pill label={item.tag ?? "Blog"} />
          {item.category ? <Pill label={item.category} muted /> : null}
        </View>
      </View>

      <View className="px-5 py-4">
        <Text
          className="text-[18px] font-semibold text-slate-900 leading-6"
          numberOfLines={2}
        >
          {item.title}
        </Text>

        <Pressable
          className="mt-3 flex-row items-center"
          style={{ columnGap: 8 }}
          onPress={() => item.authorId && navigateToUserProfile(item.authorId)}
          hitSlop={4}
          disabled={!item.authorId}
        >
          <View className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
            <Image
              source={{ uri: item.authorAvatar }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
            />
          </View>
          <View className="flex-1 flex-row items-center" style={{ columnGap: 8 }}>
            <Text className="text-[13px] font-semibold text-slate-800">
              {item.authorName}
            </Text>
            <Dot />
            <Text className="text-[12px] text-slate-500">
              {new Date(item.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            <Dot />
            <Text className="text-[12px] text-slate-500">
              {item.readTimeMinutes} mins read
            </Text>
          </View>
        </Pressable>

        <Text
          className="mt-3 text-[14px] leading-5 text-slate-600"
          numberOfLines={3}
        >
          {item.excerpt}
        </Text>
      </View>
    </Container>
  );
}

function Pill({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{
        backgroundColor: muted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
      }}
    >
      <Text
        className="text-[11px] font-semibold uppercase tracking-[0.5px]"
        style={{ color: muted ? "#E2E8F0" : "#0F172A" }}
      >
        {label}
      </Text>
    </View>
  );
}

function Dot() {
  return <View className="h-1 w-1 rounded-full bg-slate-300" />;
}

import React from "react";
import { View, Text, Image, ImageSourcePropType, Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FeedAuthor, FeedMedia, FeedMetrics } from "../../../feed/types";

export type MomentCardItem = {
  id: string;
  author: FeedAuthor;
  title?: string;
  content: string;
  media?: FeedMedia;
  metrics?: FeedMetrics;
  liked?: boolean;
  relativeTime?: string;
};

type Props = {
  item: MomentCardItem;
  onPress?: () => void;
  onPressAuthor?: () => void;
  variant?: "compact" | "feed";
  style?: StyleProp<ViewStyle>;
};

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 6,
};

type CoverMedia = {
  source?: ImageSourcePropType;
  aspectRatio: number;
  isVideo: boolean;
  thumbnail?: ImageSourcePropType;
};

const getCoverMedia = (media?: FeedMedia): CoverMedia => {
  if (!media) {
    return { source: undefined, aspectRatio: 4 / 5, isVideo: false };
  }

  if (media.type === "video") {
    // For video, try to use thumbnail if available, otherwise use video URI as fallback
    const thumbnail = media.thumbnail
      ? { uri: media.thumbnail }
      : media.uri
        ? { uri: media.uri }
        : undefined;

    return {
      source: thumbnail,
      aspectRatio: media.aspectRatio ?? 4 / 5,
      isVideo: true,
      thumbnail,
    };
  }

  if ("items" in media && Array.isArray(media.items)) {
    const first = media.items[0];
    const uri = typeof first === "string" ? first : first?.uri;
    return {
      source: uri ? { uri } : undefined,
      aspectRatio: media.aspectRatio ?? 4 / 5,
      isVideo: false,
    };
  }

  if ("url" in media && media.url) {
    const url = media.url;
    const source =
      typeof url === "number" ? url : { uri: url };
    return {
      source,
      aspectRatio: media.aspectRatio ?? 4 / 5,
      isVideo: false,
    };
  }

  return { source: undefined, aspectRatio: media.aspectRatio ?? 4 / 5, isVideo: false };
};

export default function MomentCard({
  item,
  onPress,
  onPressAuthor,
  variant = "compact",
  style,
}: Props) {
  const cover = getCoverMedia(item.media);
  const showAuthor = variant === "feed";
  const handle = item.author.handle?.replace(/^@/, "") || item.author.handle;
  const coverHeight = variant === "compact" ? 260 : 360;
  const hasMedia = Boolean(item.media);

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 active:opacity-90"
      style={[
        cardShadow,
        variant === "compact" ? { width: 200 } : { width: "100%" },
        style,
      ]}
    >
      <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
        {showAuthor ? (
          <Pressable
            onPress={onPressAuthor}
            className="flex-row items-center px-4 py-3"
          >
            <View className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden">
              {item.author.avatar ? (
                <Image
                  source={{ uri: item.author.avatar }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center gap-1" style={{ flexShrink: 1 }}>
                <Text
                  className="text-sm font-semibold text-slate-900"
                  numberOfLines={1}
                >
                  {item.author.name}
                </Text>
                {item.author.verified && (
                  <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                )}
              </View>
              <Text className="text-xs text-slate-500" numberOfLines={1}>
                {handle ? `@${handle}` : ""}
              </Text>
            </View>
            {item.relativeTime ? (
              <Text className="text-[12px] text-slate-400 ml-2">
                {item.relativeTime}
              </Text>
            ) : null}
          </Pressable>
        ) : null}

        <View
          className="relative bg-slate-200"
          style={{ height: coverHeight }}
        >
          {cover.source ? (
            <Image
              source={cover.source}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : null}
          {cover.isVideo && hasMedia ? (
            <View className="absolute inset-0 items-center justify-center">
              <View className="h-14 w-14 rounded-full bg-black/60 items-center justify-center">
                <Ionicons name="play" size={26} color="#fff" />
              </View>
            </View>
          ) : null}
        </View>

        <View className="px-3 py-3 border-t border-slate-100">
          {item.title ? (
            <Text
              className="text-sm font-semibold text-slate-900 mb-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
          ) : null}
          <Text className="text-[13px] text-slate-600" numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

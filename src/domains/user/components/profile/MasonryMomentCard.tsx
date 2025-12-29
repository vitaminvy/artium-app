import React, { useState, useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { FeedAuthor, FeedMedia, FeedMetrics } from "../../../feed/types";
import { usePostLike } from "../../../feed/hooks/usePostLike";

export type MasonryMomentItem = {
  id: string;
  author: FeedAuthor;
  title?: string;
  content: string;
  media?: FeedMedia;
  metrics?: FeedMetrics;
  liked?: boolean;
  relativeTime?: string;
  createdAt?: number;
};

type Props = {
  item: MasonryMomentItem;
  onPress?: () => void;
  onPressAuthor?: () => void;
};

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.04,
  shadowRadius: 8,
  elevation: 3,
};

/**
 * Get card layout type based on content
 * - text-only: Only has content, no media, no title
 * - media-only: Has media but no title or short content
 * - media-title: Has media and title
 * - text-title: Has title and content but no media
 */
type CardType = "text-only" | "media-only" | "media-title" | "text-title";

const getCardType = (item: MasonryMomentItem): CardType => {
  const hasMedia = Boolean(item.media);
  const hasTitle = Boolean(item.title);
  const hasContent = Boolean(item.content && item.content.trim());

  if (hasMedia && hasTitle) return "media-title";
  if (hasMedia && !hasTitle) return "media-only";
  if (!hasMedia && hasTitle) return "text-title";
  return "text-only";
};

/**
 * Get media source and aspect ratio
 */
const getMediaInfo = (media?: FeedMedia) => {
  if (!media) return { source: undefined, aspectRatio: 1, isVideo: false };

  const isVideo = media.type === "video";

  // Get thumbnail for video
  if (isVideo) {
    const thumbnail = media.thumbnail || media.uri;
    return {
      source: thumbnail ? { uri: thumbnail } : undefined,
      aspectRatio: media.aspectRatio || 4 / 5,
      isVideo: true,
    };
  }

  // Get first image from items array
  if ("items" in media && Array.isArray(media.items) && media.items.length > 0) {
    const first = media.items[0];
    const uri = typeof first === "string" ? first : first?.uri;
    return {
      source: uri ? { uri } : undefined,
      aspectRatio: media.aspectRatio || 1,
      isVideo: false,
    };
  }

  // Get url
  if ("url" in media && media.url) {
    const source = typeof media.url === "number" ? media.url : { uri: media.url };
    return {
      source,
      aspectRatio: media.aspectRatio || 1,
      isVideo: false,
    };
  }

  return { source: undefined, aspectRatio: 1, isVideo: false };
};

export default function MasonryMomentCard({ item, onPress, onPressAuthor }: Props) {
  const cardType = getCardType(item);
  const mediaInfo = getMediaInfo(item.media);

  // Real-time metrics subscription
  const [metrics, setMetrics] = useState<FeedMetrics>(item.metrics || { likes: 0, comments: 0, shares: 0 });
  const { isLiked } = usePostLike(item.id, item.liked);

  useEffect(() => {
    // Subscribe to real-time metrics updates
    const postRef = doc(firestore, "posts", item.id);
    const unsubscribe = onSnapshot(postRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    });

    return () => unsubscribe();
  }, [item.id]);

  // Text-only card: Small, compact, just text
  if (cardType === "text-only") {
    return (
      <Pressable onPress={onPress} className="mb-3 active:opacity-90" style={cardShadow}>
        <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden p-4">
          <Text className="text-sm text-slate-700 leading-5" numberOfLines={6}>
            {item.content}
          </Text>
          <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={14}
                color={isLiked ? "#EF4444" : "#94A3B8"}
              />
              <Text className="text-xs text-slate-500">{metrics.likes || 0}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" />
              <Text className="text-xs text-slate-500">{metrics.comments || 0}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Media-only card: Full media, minimal text overlay
  if (cardType === "media-only") {
    return (
      <Pressable onPress={onPress} className="mb-3 active:opacity-90" style={cardShadow}>
        <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <View className="relative bg-slate-200" style={{ aspectRatio: mediaInfo.aspectRatio }}>
            {mediaInfo.source && (
              <Image
                source={mediaInfo.source}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
            {mediaInfo.isVideo && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="h-12 w-12 rounded-full bg-black/60 items-center justify-center">
                  <Ionicons name="play" size={20} color="#fff" />
                </View>
              </View>
            )}
            {/* Overlay for text readability */}
            {item.content && (
              <View className="absolute bottom-0 left-0 right-0 p-3" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <Text className="text-sm text-white font-medium" numberOfLines={2}>
                  {item.content}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-3 px-3 py-2">
            <View className="flex-row items-center gap-1">
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={14}
                color={isLiked ? "#EF4444" : "#94A3B8"}
              />
              <Text className="text-xs text-slate-500">{metrics.likes || 0}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" />
              <Text className="text-xs text-slate-500">{metrics.comments || 0}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Media-title card: Full media with title and text below
  if (cardType === "media-title") {
    return (
      <Pressable onPress={onPress} className="mb-3 active:opacity-90" style={cardShadow}>
        <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <View className="relative bg-slate-200" style={{ aspectRatio: mediaInfo.aspectRatio }}>
            {mediaInfo.source && (
              <Image
                source={mediaInfo.source}
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
            {mediaInfo.isVideo && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="h-12 w-12 rounded-full bg-black/60 items-center justify-center">
                  <Ionicons name="play" size={20} color="#fff" />
                </View>
              </View>
            )}
          </View>
          <View className="p-3">
            {item.title && (
              <Text className="text-sm font-semibold text-slate-900 mb-1" numberOfLines={2}>
                {item.title}
              </Text>
            )}
            {item.content && (
              <Text className="text-xs text-slate-600" numberOfLines={3}>
                {item.content}
              </Text>
            )}
            <View className="flex-row items-center gap-3 mt-2 pt-2 border-t border-slate-100">
              <View className="flex-row items-center gap-1">
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={14}
                  color={isLiked ? "#EF4444" : "#94A3B8"}
                />
                <Text className="text-xs text-slate-500">{metrics.likes || 0}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" />
                <Text className="text-xs text-slate-500">{metrics.comments || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Text-title card: Title and text, no media
  return (
    <Pressable onPress={onPress} className="mb-3 active:opacity-90" style={cardShadow}>
      <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden p-4">
        {item.title && (
          <Text className="text-base font-bold text-slate-900 mb-2" numberOfLines={3}>
            {item.title}
          </Text>
        )}
        <Text className="text-sm text-slate-700 leading-5" numberOfLines={8}>
          {item.content}
        </Text>
        <View className="flex-row items-center gap-3 mt-3 pt-3 border-t border-slate-100">
          <View className="flex-row items-center gap-1">
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={14}
              color={isLiked ? "#EF4444" : "#94A3B8"}
            />
            <Text className="text-xs text-slate-500">{metrics.likes || 0}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="chatbubble-outline" size={14} color="#94A3B8" />
            <Text className="text-xs text-slate-500">{metrics.comments || 0}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

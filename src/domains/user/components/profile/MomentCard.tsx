import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type MomentCardItem = {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar?: string;
    verified?: boolean;
  };
  content?: string;
  media?: {
    type: "image" | "video";
    uri: string;
    aspectRatio?: number;
  };
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
  createdAt?: string;
};

type Props = {
  item: MomentCardItem;
  onPress?: () => void;
  onPressAuthor?: () => void;
};

export default function MomentCard({ item, onPress, onPressAuthor }: Props) {
  return (
    <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
      {/* Author Info */}
      <Pressable
        onPress={onPressAuthor}
        className="flex-row items-center px-4 py-3"
      >
        <View className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
          {item.author.avatar && (
            <Image
              source={{ uri: item.author.avatar }}
              className="w-full h-full"
            />
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center gap-1">
            <Text className="text-sm font-semibold text-slate-900">
              {item.author.name}
            </Text>
            {item.author.verified && (
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            )}
          </View>
          <Text className="text-xs text-slate-500">{item.author.handle}</Text>
        </View>
      </Pressable>

      {/* Content */}
      {item.content && (
        <View className="px-4 pb-3">
          <Text className="text-sm text-slate-900" numberOfLines={3}>
            {item.content}
          </Text>
        </View>
      )}

      {/* Media */}
      {item.media && (
        <Pressable onPress={onPress} className="relative">
          <Image
            source={{ uri: item.media.uri }}
            className="w-full"
            style={{
              aspectRatio: item.media.aspectRatio || 1,
            }}
            resizeMode="cover"
          />
          {item.media.type === "video" && (
            <View className="absolute inset-0 items-center justify-center">
              <View className="h-12 w-12 rounded-full bg-black/40 items-center justify-center">
                <Ionicons name="play" size={24} color="white" />
              </View>
            </View>
          )}
        </Pressable>
      )}

      {/* Actions */}
      <View className="flex-row items-center px-4 py-3 gap-4">
        <View className="flex-row items-center gap-1">
          <Ionicons
            name={item.isLiked ? "heart" : "heart-outline"}
            size={20}
            color={item.isLiked ? "#EF4444" : "#64748B"}
          />
          {item.likeCount !== undefined && item.likeCount > 0 && (
            <Text className="text-xs text-slate-600">{item.likeCount}</Text>
          )}
        </View>

        <View className="flex-row items-center gap-1">
          <Ionicons name="chatbubble-outline" size={18} color="#64748B" />
          {item.commentCount !== undefined && item.commentCount > 0 && (
            <Text className="text-xs text-slate-600">{item.commentCount}</Text>
          )}
        </View>

        <Ionicons name="paper-plane-outline" size={18} color="#64748B" />
      </View>
    </View>
  );
}

import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type FeedCardProps = {
  authorName: string;
  handle: string;
  verified?: boolean;
  caption?: string;
  image?: any;
  avatarInitials?: string;
  avatarColor?: string;
  coverColor?: string;
  likes?: number;
  comments?: number;
  reposts?: number;
  liked?: boolean;
  reposted?: boolean;
  onPress?: () => void;
  onPressLike?: () => void;
  onPressRepost?: () => void;
  onPressComment?: () => void;
};

export default function FeedCard({
  authorName,
  handle,
  verified = false,
  caption,
  avatarInitials = "A",
  avatarColor = "#0EA5E9",
  coverColor = "#F1F5F9",
  image,
  likes = 1,
  comments = 0,
  reposts = 0,
  liked = false,
  reposted = false,
  onPress,
  onPressLike,
  onPressRepost,
  onPressComment,
}: FeedCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl bg-white p-4 mb-4"
      style={cardShadow}
    >
      <View className="flex-row items-center">
        <View
          className="h-12 w-12 rounded-full items-center justify-center"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-white font-bold">{avatarInitials}</Text>
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-[16px] font-semibold text-slate-900">
              {authorName}
            </Text>
            {verified ? (
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#10B981"
                style={{ marginLeft: 6 }}
              />
            ) : null}
          </View>
          <Text className="text-[13px] text-slate-500">@{handle}</Text>
        </View>
      </View>

      {caption ? (
        <Text className="mt-3 text-[15px] text-slate-900">{caption}</Text>
      ) : null}

      <View className="mt-3 rounded-2xl overflow-hidden">
        {image ? (
          <Image
            source={image}
            style={{ width: "100%", height: 320 }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ height: 320, backgroundColor: coverColor }} />
        )}
      </View>

      <View className="mt-4 flex-row items-center gap-6">
        <Pressable
          className="flex-row items-center gap-2"
          onPress={onPressLike}
          hitSlop={6}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={22}
            color={liked ? "#EF4444" : "#0f172a"}
          />
          <Text className="text-[13px] text-slate-600">{likes}</Text>
        </Pressable>
        <Pressable
          className="flex-row items-center gap-2"
          onPress={onPressRepost}
          hitSlop={6}
        >
          <Ionicons
            name="repeat-outline"
            size={22}
            color={reposted ? "#0EA5E9" : "#0f172a"}
          />
          {reposts ? (
            <Text className="text-[13px] text-slate-600">{reposts}</Text>
          ) : null}
        </Pressable>
        <Pressable
          className="flex-row items-center gap-2"
          onPress={onPressComment}
          hitSlop={6}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0f172a" />
          {comments ? (
            <Text className="text-[13px] text-slate-600">{comments}</Text>
          ) : null}
        </Pressable>
      </View>
    </Pressable>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 8,
};

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ArtistProfile } from "../../types";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { useFollow } from "@/domains/user/hooks/useFollow";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

type Props = {
  item: ArtistProfile;
  onPress?: () => void;
};

export default function ProfileCard({ item, onPress }: Props) {
  const { currentUser } = useAuth();
  const { isFollowing, toggleFollow, loading } = useFollow(
    currentUser?.uid,
    item.id
  );
  const content = (
    <View pointerEvents={onPress ? "none" : "auto"} className="items-center">
      <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
        <Image
          source={{ uri: item.avatar }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
      </View>
      <Text className="mt-3 text-base font-semibold text-slate-900 text-center">
        {item.name}
      </Text>
      <View className="flex-row items-center gap-1">
        {item.verified && (
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
        )}
        {item.title ? (
          <Text className="text-xs text-slate-500">{item.title}</Text>
        ) : null}
      </View>

      <Pressable
        className="mt-4 px-4 py-2 rounded-full active:opacity-90"
        style={{
          backgroundColor: isFollowing ? "#E2E8F0" : "#0F172A",
        }}
        disabled={!currentUser || loading}
        onPress={() => toggleFollow()}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: isFollowing ? "#0F172A" : "#fff" }}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      </Pressable>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        className="flex-1 rounded-3xl bg-white border border-slate-100 px-4 py-5 items-center"
        style={cardShadow}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      className="flex-1 rounded-3xl bg-white border border-slate-100 px-4 py-5 items-center"
      style={cardShadow}
    >
      {content}
    </View>
  );
}

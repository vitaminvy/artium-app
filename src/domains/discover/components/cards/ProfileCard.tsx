import React from "react";
import { View, Text, Pressable, GestureResponderEvent } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { ArtistProfile } from "../../types";
import { HOME_COLORS } from "../../../home/constants";
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
  isFollowing?: boolean;
  onToggleFollow?: (id: string) => void;
};

export default function ProfileCard({ item, onPress, isFollowing = false, onToggleFollow }: Props) {
  const { currentUser } = useAuth();
  const { isFollowing: isFollowingFromHook, toggleFollow } = useFollow(
    currentUser?.uid,
    item.id
  );

  // Use hook's isFollowing state if no prop is provided
  const actualIsFollowing = isFollowing ?? isFollowingFromHook;

  const handleFollowPress = (e: GestureResponderEvent) => {
    e.stopPropagation?.();
    if (onToggleFollow) {
      onToggleFollow(item.id);
    } else {
      toggleFollow();
    }
  };

  const FollowIcon = actualIsFollowing ? (
    <View style={{ width: 16, height: 16 }}>
      <Ionicons name="person-outline" size={16} color={HOME_COLORS.TEXT_PRIMARY} />
      <View
        style={{
          position: "absolute",
          right: -2,
          bottom: -2,
          width: 10,
          height: 10,
          borderRadius: 999,
          backgroundColor: HOME_COLORS.VERIFIED_BADGE,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="checkmark" size={7} color={HOME_COLORS.WHITE} />
      </View>
    </View>
  ) : (
    <Ionicons name="person-add-outline" size={16} color={HOME_COLORS.TEXT_PRIMARY} />
  );
  const content = (
    <View className="items-center">
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
        className="mt-4 flex-row items-center gap-2 rounded-full border px-4 py-2 active:opacity-90"
        style={{
          borderColor: actualIsFollowing ? HOME_COLORS.FOLLOWING_BORDER : HOME_COLORS.FOLLOW_BORDER,
          backgroundColor: actualIsFollowing ? HOME_COLORS.FOLLOWING_BG : HOME_COLORS.FOLLOW_BG,
        }}
        onPress={handleFollowPress}
      >
        {FollowIcon}
        <Text className="text-[12px] font-semibold text-slate-900">
          {actualIsFollowing ? "Following" : "Follow"}
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

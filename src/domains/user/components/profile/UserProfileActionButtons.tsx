import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  isFollowing: boolean;
  onPressFollow?: () => void;
  onPressShare?: () => void;
};

export default function UserProfileActionButtons({
  isFollowing,
  onPressFollow,
  onPressShare,
}: Props) {
  return (
    <View className="flex-row px-6 pb-4" style={{ columnGap: 12 }}>
      <ActionButton
        icon={isFollowing ? "checkmark-outline" : "person-add-outline"}
        label={isFollowing ? "Following" : "Follow"}
        onPress={onPressFollow}
        variant={isFollowing ? "secondary" : "primary"}
      />
      <ActionButton
        icon="share-social-outline"
        label="Share Profile"
        onPress={onPressShare}
        variant="secondary"
      />
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  variant = "secondary",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center rounded-full px-4 py-3 ${
        isPrimary
          ? "bg-slate-900"
          : "border border-slate-200 bg-white"
      }`}
      hitSlop={6}
    >
      <Ionicons
        name={icon}
        size={18}
        color={isPrimary ? "#FFFFFF" : "#0F172A"}
      />
      <Text
        className={`ml-2 text-sm font-semibold ${
          isPrimary ? "text-white" : "text-slate-800"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

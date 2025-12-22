import React from "react";
import { View, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  onPressEdit?: () => void;
  onPressShare?: () => void;
};

export default function ProfileActionButtons({
  onPressEdit,
  onPressShare,
}: Props) {
  return (
    <View className="flex-row px-6 pb-4" style={{ columnGap: 12 }}>
      <ActionButton
        icon="create-outline"
        label="Edit Profile"
        onPress={onPressEdit}
      />
      <ActionButton
        icon="share-social-outline"
        label="Share Profile"
        onPress={onPressShare}
      />
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3"
      hitSlop={6}
    >
      <Ionicons name={icon} size={18} color="#0F172A" />
      <Text className="ml-2 text-sm font-semibold text-slate-800">{label}</Text>
    </Pressable>
  );
}

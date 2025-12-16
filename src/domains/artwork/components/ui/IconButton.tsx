import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type IconButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  bg?: string;
};

export default function IconButton({
  icon,
  onPress,
  color = "#0F172A",
  bg,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 rounded-full items-center justify-center active:opacity-80"
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

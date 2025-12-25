import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export default function FilterPill({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 rounded-full border px-4 py-2"
      style={{
        borderColor: active ? "#0B73FF" : "#E2E8F0",
        backgroundColor: "#FFFFFF",
      }}
    >
      <Text
        className="text-[12px] font-semibold"
        style={{ color: active ? "#0B73FF" : "#0F172A" }}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-down-outline"
        size={14}
        color={active ? "#0B73FF" : "#0F172A"}
      />
    </Pressable>
  );
}

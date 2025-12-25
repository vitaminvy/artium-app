import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyStateCard({
  title,
  description,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white px-5 py-6 items-center">
      <Text className="text-base font-semibold text-slate-900">
        {title}
      </Text>
      {description ? (
        <Text className="mt-2 text-center text-[13px] text-slate-500">
          {description}
        </Text>
      ) : null}
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          className="mt-4 flex-row items-center gap-2 rounded-full border border-[#0B73FF] px-5 py-2.5"
        >
          <View className="h-6 w-6 rounded-full bg-[#0B73FF] items-center justify-center">
            <Ionicons name="add" size={14} color="#FFFFFF" />
          </View>
          <Text className="text-[13px] font-semibold text-[#0B73FF]">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

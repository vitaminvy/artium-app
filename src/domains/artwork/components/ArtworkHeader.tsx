import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ArtworkHeaderProps = {
  onBack: () => void;
  onShare: () => void;
  onOptions: () => void;
};

export default function ArtworkHeader({
  onBack,
  onShare,
  onOptions,
}: ArtworkHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row items-center justify-between px-4 border-b border-slate-100 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: 12, zIndex: 50 }}
    >
      <Pressable
        className="h-10 w-10 items-center justify-center"
        onPress={onBack}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color="#0F172A" />
      </Pressable>
      <View className="flex-row items-center gap-3">
        <Pressable
          className="h-10 w-10 items-center justify-center"
          onPress={onShare}
          hitSlop={8}
        >
          <Ionicons name="share-outline" size={22} color="#0F172A" />
        </Pressable>
        <Pressable
          className="h-10 w-10 items-center justify-center"
          hitSlop={8}
          onPress={onOptions}
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
}

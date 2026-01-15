import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { ProfileMoodboard } from "../../types";

type Props = {
  moodboard: ProfileMoodboard;
  onPress?: () => void;
  variant?: "grid" | "carousel";
  style?: ViewStyle;
};

export default function MoodboardCard({
  moodboard,
  onPress,
  variant = "grid",
  style,
}: Props) {
  const CardComponent = onPress ? Pressable : View;
  const cover = moodboard.coverImage;
  const ownerInitial = moodboard.ownerName?.charAt(0)?.toUpperCase?.() ?? "U";
  const cardWidth = variant === "carousel" ? 240 : undefined;

  return (
    <CardComponent
      onPress={onPress}
      className="active:opacity-90"
      style={[
        {
          width: cardWidth,
          borderRadius: 24,
          paddingBottom: 4,
          backgroundColor: "#fff",
          borderWidth: 1,
          borderColor: "#E2E8F0",
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 4,
        },
        style,
      ]}
    >
      <View className="relative">
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={{ width: "100%", aspectRatio: 3 / 4 }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
          />
        ) : (
          <View
            className="w-full"
            style={{
              aspectRatio: 3 / 4,
              backgroundColor: moodboard.previewColor ?? "#E2E8F0",
            }}
          />
        )}

        <View className="absolute top-3 left-3 bg-white/95 px-3 py-1.5 rounded-full border border-slate-200">
          <Text className="text-[11px] font-semibold text-slate-900 tracking-[0.5px]">
            MOODBOARD
          </Text>
        </View>
      </View>

      <View
        className="flex-row items-center"
        style={{ columnGap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 18 }}
      >
        <View className="h-9 w-9 rounded-full overflow-hidden bg-slate-200 items-center justify-center">
          {moodboard.ownerAvatar ? (
            <Image
              source={{ uri: moodboard.ownerAvatar }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <Text className="text-sm font-semibold text-slate-700">
              {ownerInitial}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
            {moodboard.title}
          </Text>
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            by {moodboard.ownerName}
          </Text>
        </View>
      </View>
    </CardComponent>
  );
}

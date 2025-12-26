import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ArtistProfile } from "../../types";
import { HOME_COLORS } from "../../../home/constants";

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
  const content = (
    <View pointerEvents={onPress ? "none" : "auto"} className="items-center">
      <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
        <Image source={{ uri: item.avatar }} className="h-full w-full" />
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
          borderColor: HOME_COLORS.FOLLOW_BORDER,
          backgroundColor: HOME_COLORS.FOLLOW_BG,
        }}
      >
        <Ionicons name="person-add-outline" size={16} color={HOME_COLORS.TEXT_PRIMARY} />
        <Text className="text-[12px] font-semibold text-slate-900">Follow</Text>
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

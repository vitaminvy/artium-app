import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { HomeFollowingProfile } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

type Props = {
  item: HomeFollowingProfile;
  onPress?: (item: HomeFollowingProfile) => void;
};

export default function HomeFollowingCard({ item, onPress }: Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="flex-1 rounded-3xl bg-white border border-slate-100 px-4 py-5 items-center"
      style={cardShadow}
      onPress={() => onPress?.(item)}
    >
      <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
        <Image
          source={{ uri: item.avatar }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
      </View>

      <Text className="mt-3 text-[15px] font-semibold text-slate-900 text-center">
        {item.name}
      </Text>

      <View className="flex-row items-center gap-1">
        {item.verified ? (
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
        ) : null}
        {item.subtitle ? (
          <Text className="text-[11px] text-slate-500">{item.subtitle}</Text>
        ) : null}
      </View>

      <Pressable className="mt-4 flex-row items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
        <Ionicons name="person-add-outline" size={14} color="#0F172A" />
        <Text className="text-[12px] font-semibold text-slate-900">
          {item.actionLabel ?? "Follow"}
        </Text>
      </Pressable>
    </Container>
  );
}

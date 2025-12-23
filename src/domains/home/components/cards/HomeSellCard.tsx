import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { HomeSellItem } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

type Props = {
  item: HomeSellItem;
  onPress?: (item: HomeSellItem) => void;
};

export default function HomeSellCard({ item, onPress }: Props) {
  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="flex-1 rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
      onPress={() => onPress?.(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", aspectRatio: 3 / 4 }}
        contentFit="cover"
        transition={0}
        cachePolicy="memory-disk"
      />

      <View className="px-3 py-3 gap-2">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden">
            {item.artistAvatar ? (
              <Image
                source={{ uri: item.artistAvatar }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
            ) : null}
          </View>
          <Text className="text-[11px] font-semibold text-slate-500">
            {item.artist}
          </Text>
          {item.verified ? (
            <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
          ) : null}
        </View>

        <Text
          className="text-[14px] font-semibold text-slate-900"
          numberOfLines={1}
        >
          {item.title}
        </Text>

        <View className="self-start rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1">
          <Text className="text-[11px] font-semibold text-blue-600">
            {item.price}
          </Text>
        </View>
      </View>
    </Container>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import type { Artwork, InventoryStatus } from "@/domains/inventory/types";

type Props = {
  item: Artwork;
  selected?: boolean;
  onPress?: () => void;
};

const renderStatusBadge = (status: InventoryStatus) => {
  const config: Record<InventoryStatus, { bg: string; text: string }> = {
    Available: { bg: "#DCFCE7", text: "#15803D" },
    "On Hold": { bg: "#FEF3C7", text: "#B45309" },
    Sold: { bg: "#FEE2E2", text: "#B91C1C" },
  };
  const { bg, text } = config[status];
  return (
    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: bg }}>
      <Text className="text-xs font-semibold" style={{ color: text }}>
        {status}
      </Text>
    </View>
  );
};

export default function InvoiceArtworkSelectCard({
  item,
  selected = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border p-3 ${
        selected ? "border-[#0B73FF] bg-[#EFF6FF]" : "border-slate-200 bg-white"
      }`}
    >
      <View className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100">
        <Image
          source={{ uri: item.thumbnail }}
          style={{ height: "100%", width: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
        {selected ? (
          <View className="absolute inset-0 bg-[#0B73FF]/10 items-center justify-center">
            <Ionicons name="checkmark-circle" size={26} color="#0B73FF" />
          </View>
        ) : null}
      </View>

      <View className="flex-1 justify-center">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-base font-semibold text-slate-900">
              {item.title}
            </Text>
            <Text className="text-sm text-slate-500 mt-0.5">
              {item.artist} • {item.year}
            </Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-slate-500">{item.dimensions}</Text>
            <Text className="text-lg font-bold text-slate-900">
              {item.price}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

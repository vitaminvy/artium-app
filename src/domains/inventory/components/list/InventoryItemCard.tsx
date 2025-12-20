import React from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Artwork, InventoryStatus, ViewMode } from "../../types";

const screenPadding = 20;
const cardWidth = (Dimensions.get("window").width - screenPadding * 2 - 14) / 2;

type Props = {
  item: Artwork;
  variant: ViewMode;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
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

export function InventoryItemCard({
  item,
  variant,
  isSelected,
  onPress,
  onLongPress,
}: Props) {
  if (variant === "list") {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        className={`flex-row items-center gap-3 rounded-2xl border bg-white p-3 ${
          isSelected ? "border-[#0B73FF] shadow-sm" : "border-slate-200"
        }`}
      >
        <View className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100">
          <Image
            source={{ uri: item.thumbnail }}
            resizeMode="cover"
            style={{ height: "100%", width: "100%" }}
          />
          {isSelected ? (
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
            <View className="items-end">
              <Text className="text-xs font-semibold text-slate-500">
                Folder
              </Text>
              <Text className="text-sm font-semibold text-slate-800">
                {item.folder}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Grid variant
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className={`rounded-2xl border bg-white p-3 ${
        isSelected ? "border-[#0B73FF] shadow-sm" : "border-slate-200"
      }`}
      style={{ width: cardWidth }}
    >
      <View className="rounded-xl overflow-hidden bg-slate-100 h-36 mb-3">
        <Image
          source={{ uri: item.thumbnail }}
          resizeMode="cover"
          style={{ height: "100%", width: "100%" }}
        />
        {isSelected ? (
          <View className="absolute inset-0 bg-[#0B73FF]/15 items-center justify-center">
            <Ionicons name="checkmark-circle" size={26} color="#0B73FF" />
          </View>
        ) : null}
      </View>
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <Text
            className="text-[15px] font-semibold text-slate-900"
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ minHeight: 40 }}
          >
            {item.title}
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {item.artist} • {item.year}
          </Text>
        </View>
        {renderStatusBadge(item.status)}
      </View>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-base font-bold text-slate-900">{item.price}</Text>
        <Text className="text-xs font-semibold text-slate-600">
          {item.folder}
        </Text>
      </View>
    </Pressable>
  );
}

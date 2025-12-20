import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Artist } from "../../types";

type Props = {
  item: Artist;
  variant?: "list" | "grid";
  width?: number;
  onPress?: () => void;
};

export function ArtistCard({ item, variant = "list", width, onPress }: Props) {
  const representedChip = (
    <View
      className={`px-3 py-1 rounded-full ${
        item.represented ? "bg-[#DCFCE7]" : "bg-slate-100"
      }`}
    >
      <Text
        className={`text-xs font-semibold ${
          item.represented ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {item.represented ? "Represented" : "Independent"}
      </Text>
    </View>
  );

  if (variant === "grid") {
    return (
      <Pressable
        onPress={onPress}
        className="rounded-2xl border border-slate-200 bg-white p-3 items-center"
        style={width ? { width } : undefined}
      >
        <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 mb-3">
          <Image
            source={{ uri: item.avatar }}
            resizeMode="cover"
            style={{ height: "100%", width: "100%" }}
          />
        </View>
        <Text className="text-base font-semibold text-slate-900 text-center">
          {item.name}
        </Text>
        <Text className="text-xs text-slate-500 text-center mt-0.5">
          {item.origin}
        </Text>
        <Text className="text-xs text-slate-500 mt-1">
          {item.artworks} artworks
        </Text>
        <View className="mt-2">{representedChip}</View>
      </Pressable>
    );
  }

  return (
    <View className="flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <View className="h-14 w-14 rounded-full overflow-hidden bg-slate-100">
        <Image
          source={{ uri: item.avatar }}
          resizeMode="cover"
          style={{ height: "100%", width: "100%" }}
        />
      </View>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-semibold text-slate-900">
              {item.name}
            </Text>
            <Text className="text-sm text-slate-500">{item.origin}</Text>
          </View>
          {representedChip}
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm text-slate-500">
            {item.artworks} artworks in inventory
          </Text>
          <Pressable className="flex-row items-center gap-1">
            <Text className="text-sm font-semibold text-[#0B73FF]">
              View profile
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#0B73FF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

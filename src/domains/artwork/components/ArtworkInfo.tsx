import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ArtworkDetail } from "../types";

type ArtworkInfoProps = {
  detail: ArtworkDetail;
};

export default function ArtworkInfo({ detail }: ArtworkInfoProps) {
  const hasAvatar =
    typeof detail.artist.avatar === "string" &&
    detail.artist.avatar.trim().length > 0;
  const fallbackLogo = require("../../../../assets/logos/logo-light-mode.png");

  return (
    <>
      <View className="px-4 pt-6">
        <Text className="text-2xl font-bold text-slate-900">{detail.title}</Text>

        <View className="flex-row items-center gap-3 mt-3">
          <View className="h-12 w-12 rounded-full overflow-hidden bg-slate-200">
            {hasAvatar ? (
              <Image
                source={{ uri: detail.artist.avatar }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-white">
                <Image
                  source={fallbackLogo}
                  style={{ width: "60%", height: "60%" }}
                  resizeMode="contain"
                />
              </View>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-slate-900">
              {detail.artist.name}
            </Text>
            {detail.artist.verified ? (
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center gap-4 mt-4">
          <View className="flex-row items-center gap-1">
            <Ionicons name="pricetag-outline" size={16} color="#94A3B8" />
            <Text className="text-sm text-slate-500">
              {detail.stats.worksSold} works sold
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={16} color="#94A3B8" />
            <Text className="text-sm text-slate-500">
              {detail.stats.buyers} buyers
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-5 border-b border-slate-100" />

      <View className="px-4 py-5 gap-3">
        <View className="flex-row items-center gap-3">
          <View className="h-3 w-3 rounded-full bg-[#0B73FF]" />
          <Text className="text-xl font-extrabold text-slate-900">
            {detail.price}
          </Text>
        </View>
        {detail.availabilityNote ? (
          <Text className="text-base italic text-slate-600 mt-1">
            {detail.availabilityNote}
          </Text>
        ) : null}
      </View>
    </>
  );
}

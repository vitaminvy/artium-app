import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function InventoryEmptyState() {
  return (
    <View className="items-center justify-center py-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50 mt-4">
      <View className="h-12 w-12 rounded-full bg-white items-center justify-center border border-slate-200">
        <Ionicons name="images-outline" size={22} color="#0B73FF" />
      </View>
      <Text className="mt-3 text-base font-semibold text-slate-900">
        No results found
      </Text>
      <Text className="mt-1 text-sm text-slate-500 px-10 text-center">
        Try adjusting your search or start uploading new artworks.
      </Text>
    </View>
  );
}

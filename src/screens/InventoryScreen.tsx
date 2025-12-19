import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#F8FAFC]" style={{ paddingTop: Math.max(insets.top, 12) }}>
      <View className="px-6 pb-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-semibold text-slate-900">Inventory</Text>
            <Text className="text-sm text-slate-500 mt-1">
              Manage your uploaded artworks. Placeholder UI.
            </Text>
          </View>
          <Pressable className="h-10 w-10 rounded-full bg-white border border-slate-200 items-center justify-center active:opacity-80">
            <Ionicons name="ellipsis-horizontal" size={20} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 24) + 24,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-3xl border border-slate-200 bg-white px-4 py-3 flex-row items-center justify-between">
          <View>
            <Text className="text-base font-semibold text-slate-900">All Artworks</Text>
            <Text className="text-xs text-slate-500">3 items • Placeholder data</Text>
          </View>
          <Pressable className="h-10 px-4 rounded-full bg-[#0B73FF] items-center justify-center active:opacity-90">
            <Text className="text-sm font-semibold text-white">Add new</Text>
          </Pressable>
        </View>

        {Array.from({ length: 3 }).map((_, idx) => (
          <View
            key={`inventory-placeholder-${idx}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 gap-2"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-900">
                Artwork #{idx + 1}
              </Text>
              <View className="px-3 py-1 rounded-full bg-slate-100">
                <Text className="text-xs font-semibold text-slate-600">Draft</Text>
              </View>
            </View>
            <Text className="text-sm text-slate-600">
              Placeholder listing. Replace with real data once inventory API is ready.
            </Text>
            <View className="flex-row items-center gap-3 mt-1">
              <View className="h-8 px-3 rounded-full bg-slate-100 items-center justify-center">
                <Text className="text-xs font-semibold text-slate-700">Inquire</Text>
              </View>
              <Text className="text-xs text-slate-500">Updated just now</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

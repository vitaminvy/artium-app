import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { InventoryStatus } from "../../types";

type Props = {
  selectedCount: number;
  onClear: () => void;
  onMoveToFolder: (folder: string) => void;
  onUpdateStatus: (status: InventoryStatus) => void;
  onRemove: () => void;
};

export function BulkActions({
  selectedCount,
  onClear,
  onMoveToFolder,
  onUpdateStatus,
  onRemove,
}: Props) {
  if (selectedCount === 0) return null;

  return (
    <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3 mb-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-slate-900">
          {selectedCount} selected
        </Text>
        <Pressable onPress={onClear} className="px-2 py-1">
          <Text className="text-sm font-medium text-[#0B73FF]">Clear</Text>
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-2">
        <ActionChip
          icon="folder-open-outline"
          label="Move to folder"
          onPress={() => onMoveToFolder("Archive")}
        />
        <ActionChip
          icon="checkmark-done-outline"
          label="Mark as sold"
          onPress={() => onUpdateStatus("Sold")}
        />
        <ActionChip
          icon="time-outline"
          label="Put on hold"
          onPress={() => onUpdateStatus("On Hold")}
        />
        <ActionChip
          icon="trash-outline"
          label="Remove"
          onPress={onRemove}
          tone="destructive"
        />
      </View>
    </View>
  );
}

function ActionChip({
  icon,
  label,
  onPress,
  tone = "default",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: "default" | "destructive";
}) {
  const bg = tone === "destructive" ? "bg-rose-50" : "bg-slate-100";
  const text = tone === "destructive" ? "text-rose-600" : "text-slate-700";
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-full px-3 py-2 ${bg}`}
    >
      <Ionicons
        name={icon}
        size={16}
        color={tone === "destructive" ? "#E11D48" : "#0F172A"}
      />
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </Pressable>
  );
}

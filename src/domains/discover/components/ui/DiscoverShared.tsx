import React from "react";
import { View, Text, Pressable } from "react-native";

// --- Badge ---
export function Badge({
  label,
  color,
  ghost,
}: {
  label: string;
  color: string;
  ghost?: boolean;
}) {
  const backgroundColor = ghost ? `${color}15` : color;
  const textColor = ghost ? color : "#FFFFFF";

  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor }}
    >
      <Text
        className={`text-[10px] font-semibold uppercase`}
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}

// --- Pill ---
export function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Text className="text-[12px] font-semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

// --- TabChip ---
type TabChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function TabChip({ label, active, onPress }: TabChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border"
      style={[
        chipStyle,
        {
          backgroundColor: active ? "#0B1223" : "#FFFFFF",
          borderColor: active ? "#0B1223" : "#E2E8F0",
        },
      ]}
    >
      <Text
        className={`text-[12px] font-semibold ${
          active ? "text-white" : "text-slate-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const chipStyle = {
  paddingHorizontal: 14,
  paddingVertical: 8,
  minHeight: 36,
};

// --- Section ---
export function Section({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="py-3">
      <View className="px-4 mb-2 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
        {actionLabel ? (
          <Pressable onPress={onAction}>
            <Text className="text-xs font-semibold text-slate-500">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

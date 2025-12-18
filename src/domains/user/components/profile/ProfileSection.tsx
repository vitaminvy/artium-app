import React from "react";
import { View, Text, Pressable } from "react-native";

type Action = {
  label: string;
  onPress?: () => void;
  tone?: "primary" | "muted";
};

type Props = {
  title: string;
  actions?: Action[];
  children: React.ReactNode;
};

export default function ProfileSection({ title, actions, children }: Props) {
  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-lg font-semibold text-slate-900">{title}</Text>
        <View className="flex-row items-center" style={{ columnGap: 14 }}>
          {actions?.map((action) => (
            <Pressable key={action.label} onPress={action.onPress} hitSlop={6}>
              <Text
                className={`text-xs font-semibold ${
                  action.tone === "primary"
                    ? "text-slate-900"
                    : "text-slate-500"
                }`}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      {children}
    </View>
  );
}

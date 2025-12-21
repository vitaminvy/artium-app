import React from "react";
import { View, Text } from "react-native";

type SummaryRowProps = {
  label: string;
  value: string;
};

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-slate-600">{label}</Text>
      <Text className="text-sm text-slate-900">{value}</Text>
    </View>
  );
}

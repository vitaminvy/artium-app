import React from "react";
import { Pressable, Text, View } from "react-native";

type Stat = {
  label: string;
  value: number;
};

type Props = {
  title: string;
  stats: Stat[];
  onSeeAll?: () => void;
};

export default function SummaryCard({ title, stats, onSeeAll }: Props) {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-[15px] font-semibold text-slate-900">{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text className="text-[13px] font-semibold text-[#0B73FF]">See all</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="flex-row justify-between">
        {stats.map((item) => (
          <View key={item.label} className="flex-1 items-center">
            <Text className="text-xl font-semibold text-slate-900">{item.value}</Text>
            <Text className="mt-1 text-[12px] text-slate-600">{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

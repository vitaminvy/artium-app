import React from "react";
import { Text, View } from "react-native";

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
};

export function SectionCard({ title, children, subtitle }: SectionCardProps) {
  return (
    <View className="rounded-[24px] border border-slate-200 bg-white p-5 gap-5">
      <View className="gap-1">
        <Text className="text-[12px] font-semibold text-slate-600 uppercase tracking-[1px]">
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-slate-400">{subtitle}</Text>
        ) : null}
      </View>
      <View className="gap-5">{children}</View>
    </View>
  );
}

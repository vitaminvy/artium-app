import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type GuaranteeItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: React.ReactNode;
};

export function GuaranteeItem({ icon, title, description }: GuaranteeItemProps) {
  return (
    <View className="flex-row gap-4">
      <View className="h-10 w-10 rounded-full items-center justify-center bg-[#E0F2FE]">
        <Ionicons name={icon} size={20} color="#0B73FF" />
      </View>
      <View className="flex-1 gap-2">
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
        {typeof description === "string" ? (
          <Text className="text-sm text-slate-500 leading-5">
            {description}
          </Text>
        ) : (
          description
        )}
      </View>
    </View>
  );
}

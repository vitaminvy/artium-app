import React from "react";
import { View, Text, Pressable, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type InfoBlockProps = {
  label: string;
  value: string;
};

export function InfoBlock({ label, value }: InfoBlockProps) {
  return (
    <View className="flex-1">
      <Text className="text-xs font-semibold text-slate-500 uppercase">
        {label}
      </Text>
      <Text className="text-base font-semibold text-slate-900 mt-1">
        {value}
      </Text>
    </View>
  );
}

type InfoBlockWithConvertProps = InfoBlockProps & {
  convertLabel: string;
  convertValue: string;
  visible: boolean;
  onToggle: () => void;
};

const cardShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

export function InfoBlockWithConvert({
  label,
  value,
  convertLabel,
  convertValue,
  visible,
  onToggle,
}: InfoBlockWithConvertProps) {
  return (
    <View className="flex-1 relative">
      <View className="flex-row items-center gap-2">
        <Text className="text-xs font-semibold text-slate-500 uppercase">
          {label}
        </Text>
        <Pressable hitSlop={6} onPress={onToggle}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#0F172A"
          />
        </Pressable>
      </View>
      <Text className="text-base font-semibold text-slate-900 mt-1">
        {value}
      </Text>

      {visible ? (
        <View
          className="absolute top-8 right-0 left-0 bg-white rounded-2xl px-4 py-3"
          style={[
            cardShadow,
            {
              zIndex: 30,
              elevation: 8,
            },
          ]}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs font-semibold text-slate-500">
              {convertLabel}
            </Text>
            <Pressable onPress={onToggle} hitSlop={8}>
              <Ionicons name="close" size={16} color="#0F172A" />
            </Pressable>
          </View>
          <Text className="text-lg font-semibold text-slate-900">
            {convertValue}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";

type UnitToggleProps<T extends string> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
};

export function UnitToggle<T extends string>({
  value,
  options,
  onChange,
}: UnitToggleProps<T>) {
  return (
    <View className="flex-row items-center gap-4">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-row items-center gap-2 active:opacity-80"
          >
            <View
              className={`h-5 w-5 rounded-full border items-center justify-center ${
                active ? "border-[#0B73FF]" : "border-slate-300"
              }`}
            >
              {active ? (
                <View className="h-2.5 w-2.5 rounded-full bg-[#0B73FF]" />
              ) : null}
            </View>
            <Text
              className={`text-sm ${
                active ? "text-slate-900 font-semibold" : "text-slate-500"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

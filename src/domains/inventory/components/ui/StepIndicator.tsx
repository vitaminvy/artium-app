import React from "react";
import { Text, View } from "react-native";

type StepIndicatorProps = {
  step: number;
  steps: string[];
};

export function StepIndicator({ step, steps }: StepIndicatorProps) {
  return (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row items-center gap-3">
        {steps.map((label, index) => (
          <View
            key={`${label}-${index}`}
            className={`flex-1 h-2 rounded-full ${
              index <= step ? "bg-emerald-400" : "bg-emerald-100"
            }`}
          />
        ))}
      </View>
      <View className="mt-3 flex-row justify-center gap-8">
        {steps.map((label, index) => {
          const isActive = index === step;
          return (
            <Text
              key={`${label}-label`}
              className={`text-[15px] font-semibold ${
                isActive ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

import React from "react";
import { Pressable, Text, View } from "react-native";

type TabItemProps = {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  onLongPress?: () => void;
};

const activeGlowStyle = {
  shadowColor: "#7BE58F",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 10,
  elevation: 8,
};

export default function TabItem({
  label,
  icon,
  isActive,
  onPress,
  onLongPress,
}: TabItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : undefined}
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center py-2"
    >
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${
          isActive ? "bg-[#e6ffe6]" : ""
        }`}
        style={isActive ? activeGlowStyle : undefined}
      >
        {icon}
      </View>
      <Text
        className={`mt-1 text-[13px] ${
          isActive ? "font-semibold text-black" : "font-medium text-[#777777]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

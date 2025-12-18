import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PROFILE_ACCENT, PROFILE_STRINGS } from "../../constants/profile";

type Props = {
  onPressBack?: () => void;
  onPressMenu?: () => void;
  onLayout?: (e: any) => void;
};

export default function ProfileHeader({ onPressBack, onPressMenu, onLayout }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top + 6, 24); // align with ScreenHeader

  return (
    <View className="bg-white border-b border-slate-100" onLayout={onLayout}>
      <View
        className="flex-row items-center justify-between px-8 pb-4"
        style={{ paddingTop: topPad }}
      >
        <Pressable
          onPress={onPressBack}
          hitSlop={10}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>

        <View className="items-center">
          <Text className="text-xl font-extrabold tracking-[1px] text-slate-900">
            {PROFILE_STRINGS.headerTitle}
          </Text>
          <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
            <AccentStroke />
            <AccentStroke delay />
            <AccentStroke />
          </View>
        </View>

        <Pressable
          onPress={onPressMenu}
          hitSlop={10}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Ionicons name="menu-outline" size={24} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
}

function AccentStroke({ delay }: { delay?: boolean }) {
  return (
    <View
      className="h-2 w-4 rounded-full"
      style={{
        backgroundColor: PROFILE_ACCENT,
        transform: [{ rotate: delay ? "-10deg" : "10deg" }],
      }}
    />
  );
}

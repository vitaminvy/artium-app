import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  title?: string;
  onPressBack?: () => void;
  onPressSidebar?: () => void;
  isSidebarOpen?: boolean;
  onLayout?: (e: any) => void;
};

const EVENT_ACCENT = "#9BE163";

export default function EventHeader({
  title = "EVENTS",
  onPressBack,
  onPressSidebar,
  isSidebarOpen = false,
  onLayout,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-white border-b border-slate-100" onLayout={onLayout}>
      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <Pressable
          onPress={onPressBack}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>

        <View className="items-center">
          <Text className="text-xl font-extrabold tracking-[1px] text-slate-900">
            {title}
          </Text>
          <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
            <AccentStroke />
            <AccentStroke delay />
            <AccentStroke />
          </View>
        </View>

        <Pressable
          onPress={onPressSidebar}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons
            name={isSidebarOpen ? "close" : "menu"}
            size={22}
            color="#0F172A"
          />
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
        backgroundColor: EVENT_ACCENT,
        transform: [{ rotate: delay ? "-10deg" : "10deg" }],
      }}
    />
  );
}

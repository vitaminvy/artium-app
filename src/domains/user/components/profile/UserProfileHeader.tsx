import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPressBack?: () => void;
  onLayout?: (e: any) => void;
};

export default function UserProfileHeader({ onPressBack, onLayout }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-white border-b border-slate-100" onLayout={onLayout}>
      <View
        className="flex-row items-center px-4"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <Pressable
          onPress={onPressBack}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
      </View>
    </View>
  );
}

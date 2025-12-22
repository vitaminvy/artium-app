import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AuthGoogleButton({
  label,
  onPress,
  loading,
  disabled,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className="flex-1 max-w-[280px] h-[58px] border border-gray-200 rounded-full bg-white shadow-sm items-center justify-center active:bg-gray-50"
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          <Ionicons name="logo-google" size={26} color="#DB4437" />
          <Text className="text-base font-semibold text-gray-900">{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

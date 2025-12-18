import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value?: string;
  onPick?: () => void;
};

export default function AvatarUploader({ value, onPick }: Props) {
  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-slate-500 mb-2">
        PROFILE PICTURE <Text className="text-red-500">*</Text>
      </Text>
      <Pressable
        onPress={onPick}
        className="h-44 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center"
        style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 }}
      >
        {value ? (
          <View className="items-center">
            <Ionicons name="checkmark-circle" size={30} color="#22C55E" />
            <Text className="mt-2 text-xs text-slate-600">Image selected</Text>
          </View>
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={30} color="#94A3B8" />
            <Text className="mt-2 text-xs text-slate-500">Upload</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

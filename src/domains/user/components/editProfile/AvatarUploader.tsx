import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value?: string;
  onPick?: () => void;
  onClear?: () => void;
};

export default function AvatarUploader({ value, onPick, onClear }: Props) {
  return (
    <View className="mb-5">
      <Text className="text-base font-semibold text-slate-500 mb-2">
        PROFILE PICTURE <Text className="text-red-500">*</Text>
      </Text>
      <Pressable
        onPress={onPick}
        className="h-44 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center overflow-hidden"
        style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 }}
      >
        {value ? (
          <>
            <Image
              source={{ uri: value }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
            <Pressable
              onPress={onClear}
              hitSlop={8}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/85 items-center justify-center"
            >
              <Ionicons name="close" size={18} color="#0F172A" />
            </Pressable>
          </>
        ) : (
          <View className="items-center">
            <Ionicons name="cloud-upload-outline" size={30} color="#94A3B8" />
            <Text className="mt-2 text-xs text-slate-500">Upload</Text>
          </View>
          
        )}
      </Pressable>
    </View>
  );
}

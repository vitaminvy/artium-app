import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { PostMomentMedia } from "../types";
import { CURRENT_USER } from "../constants";

type Props = {
  text: string;
  media?: PostMomentMedia;
  onChangeText: (value: string) => void;
  onPickImage: () => void;
  onPickVideo: () => void;
};

type MediaButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
};

const MediaButton = ({ icon, label, active, onPress }: MediaButtonProps) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-3 py-3 active:opacity-80 ${
      active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
    }`}
  >
    <Ionicons name={icon} size={18} color={active ? "#fff" : "#0F172A"} />
    <Text className={`text-sm font-semibold ${active ? "text-white" : "text-slate-800"}`}>
      {label}
    </Text>
  </Pressable>
);

export default function PostMomentEditor({
  text,
  media,
  onChangeText,
  onPickImage,
  onPickVideo,
}: Props) {
  const initials = useMemo(
    () =>
      CURRENT_USER.name
        ?.split(" ")
        .map((p) => p[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? "YOU",
    []
  );

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 rounded-full bg-slate-200 overflow-hidden items-center justify-center">
          {CURRENT_USER.avatar ? (
            <Image
              source={{ uri: CURRENT_USER.avatar }}
              className="h-full w-full"
              contentFit="cover"
            />
          ) : (
            <Text className="text-xs font-semibold text-slate-700">{initials}</Text>
          )}
        </View>
        <View>
          <Text className="text-sm font-semibold text-slate-900">
            {CURRENT_USER.name}
          </Text>
          <Text className="text-xs text-slate-500">@{CURRENT_USER.handle}</Text>
        </View>
      </View>

      <BottomSheetTextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="Share a thought or ask a question..."
        placeholderTextColor="#94A3B8"
        multiline
        maxLength={320}
        style={{
          fontSize: 16,
          color: "#0F172A",
          minHeight: 80,
          textAlignVertical: "top",
        }}
        keyboardAppearance="light"
      />

      <View className="flex-row items-center gap-3">
        <MediaButton
          icon="image-outline"
          label="Image"
          active={media?.type === "image"}
          onPress={onPickImage}
        />
        <MediaButton
          icon="videocam-outline"
          label="Video"
          active={media?.type === "video"}
          onPress={onPickVideo}
        />
      </View>
    </View>
  );
}

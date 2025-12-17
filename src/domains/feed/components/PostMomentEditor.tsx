import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { PostMomentMedia } from "../types";
import { CURRENT_USER } from "../constants";
import { getInitials } from "../utils";
import { MEDIA_CONFIG, UI_SIZES } from "../constants/media";
import { FEED_MESSAGES } from "../constants/messages";

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
  disabled?: boolean;
  onPress: () => void;
};

const MediaButton = ({ icon, label, active, disabled, onPress }: MediaButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-3 py-3 active:opacity-80 ${
      active ? "bg-slate-900 border-slate-900" : "bg-white border-slate-200"
    } ${disabled ? "opacity-60" : ""}`}
  >
    <Ionicons name={icon} size={UI_SIZES.MEDIA_EDITOR_ICON_SIZE} color={active ? "#fff" : "#0F172A"} />
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
  const initials = useMemo(() => getInitials(CURRENT_USER.name), []);

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
        placeholder={FEED_MESSAGES.MOMENT_PLACEHOLDER}
        placeholderTextColor={MEDIA_CONFIG.TEXT_PLACEHOLDER_COLOR}
        multiline
        maxLength={MEDIA_CONFIG.MAX_TEXT_LENGTH}
        style={{
          fontSize: 16,
          color: "#0F172A",
          minHeight: MEDIA_CONFIG.MIN_TEXT_HEIGHT,
          textAlignVertical: "top",
        }}
        keyboardAppearance="light"
      />

      <View className="flex-row items-center gap-3">
        <MediaButton
          icon="image-outline"
          label={FEED_MESSAGES.MEDIA_BUTTON_IMAGE}
          active={media?.type === "image"}
          onPress={onPickImage}
          disabled={media?.type === "video"}
        />
        <MediaButton
          icon="videocam-outline"
          label={FEED_MESSAGES.MEDIA_BUTTON_VIDEO}
          active={media?.type === "video"}
          onPress={onPickVideo}
          disabled={media?.type === "image"}
        />
      </View>
    </View>
  );
}

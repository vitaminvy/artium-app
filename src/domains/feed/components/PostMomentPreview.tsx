import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Video, ResizeMode } from "expo-av";
import { PostMomentMedia } from "../types";

type Props = {
  media?: PostMomentMedia;
  onRemove: () => void;
};

const formatDuration = (durationMs?: number) => {
  if (!durationMs) return "";
  const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function PostMomentPreview({ media, onRemove }: Props) {
  const aspectRatio = media?.aspectRatio ?? 0.85;
  const durationLabel = useMemo(
    () => (media?.type === "video" ? formatDuration(media.durationMs) : ""),
    [media?.durationMs, media?.type]
  );

  if (!media) return null;

  return (
    <View
      className="rounded-2xl overflow-hidden border border-slate-100 self-center mt-5 mb-6"
      style={{
        backgroundColor: "#E2E8F0",
        aspectRatio,
        width: 260,
        height: 320,
      }}
    >
      {media.type === "video" ? (
        <Video
          source={{ uri: media.uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          isLooping
        />
      ) : (
        <Image
          source={{ uri: media.uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      )}

      <View className="absolute top-3 left-3 flex-row items-center gap-2">
        <View className="px-3 py-1.5 rounded-full bg-black/55">
          <Text className="text-xs font-semibold text-white uppercase">
            {media.type}
          </Text>
        </View>
        {durationLabel ? (
          <View className="px-2 py-1 rounded-full bg-black/45">
            <Text className="text-[11px] font-semibold text-white">
              {durationLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onRemove}
        hitSlop={8}
        className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/55 items-center justify-center active:opacity-80"
      >
        <Ionicons name="close" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

export default React.memo(PostMomentPreview);

import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import { PostMomentMedia, VideoSourceLoadPayload } from "../types";
import { MEDIA_CONFIG, UI_SIZES } from "../constants/media";
import { FEED_MESSAGES } from "../constants/messages";

type Props = {
  media?: PostMomentMedia;
  onRemoveImage?: (index: number) => void;
  onClear?: () => void;
  onVideoDuration?: (durationMs: number) => void;
};

function PostMomentPreview({
  media,
  onRemoveImage,
  onClear,
  onVideoDuration,
}: Props) {
  const isVideo = media?.type === "video";
  const player = useVideoPlayer(isVideo ? media.uri : null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (isVideo) {
      player.pause();
      try {
        player.currentTime = 0;
      } catch {
        // best effort reset
      }
    }
  }, [isVideo, player]);

  useEffect(() => {
    if (!isVideo) return;
    const sub = player.addListener?.(
      "sourceLoad",
      (payload: VideoSourceLoadPayload) => {
        if (!payload?.duration && payload?.duration !== 0) return;
        const ms = payload.duration * 1000;
        if (ms && onVideoDuration) {
          onVideoDuration(ms);
        }
      }
    );
    return () => {
      sub?.remove?.();
    };
  }, [isVideo, onVideoDuration, player]);

  if (!media) return null;

  if (media.type === "video") {
    return (
      <View className="mt-6 mb-4">
        <View
          className="rounded-2xl overflow-hidden border border-slate-100 self-center"
          style={{
            width: "85%",
            aspectRatio: MEDIA_CONFIG.DEFAULT_VIDEO_ASPECT_RATIO,
            backgroundColor: MEDIA_CONFIG.PLACEHOLDER_COLOR,
          }}
        >
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            nativeControls
            allowsFullscreen={false}
            allowsPictureInPicture={false}
          />

          <Pressable
            onPress={() => onClear?.()}
            hitSlop={UI_SIZES.CLOSE_BUTTON_DEFAULT}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/55 items-center justify-center active:opacity-80"
          >
            <Ionicons
              name="close"
              size={UI_SIZES.CLOSE_ICON_LARGE}
              color="#fff"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  if (media.type === "image" && media.items.length) {
    const items = media.items;

    return (
      <View className="mt-6 mb-4 gap-3">
        <View className="flex-row flex-wrap justify-center gap-3">
          {items.map((item, idx) => {
            return (
              <View
                key={`${item.uri}-${idx}`}
                className="rounded-xl overflow-hidden border border-slate-100"
                style={{
                  width: MEDIA_CONFIG.IMAGE_GRID_ITEM_WIDTH,
                  aspectRatio: MEDIA_CONFIG.MEDIA_GRID_ASPECT_RATIO,
                  backgroundColor: MEDIA_CONFIG.PLACEHOLDER_COLOR,
                  position: "relative",
                }}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />

                <Pressable
                  onPress={() => onRemoveImage?.(idx)}
                  hitSlop={UI_SIZES.CLOSE_BUTTON_DEFAULT}
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 items-center justify-center active:opacity-80"
                >
                  <Ionicons
                    name="close"
                    size={UI_SIZES.CLOSE_ICON_DEFAULT}
                    color="#fff"
                  />
                </Pressable>
              </View>
            );
          })}
        </View>

        {onClear ? (
          <View className="items-center">
            <Pressable
              onPress={onClear}
              hitSlop={UI_SIZES.CLOSE_BUTTON_DEFAULT}
              className="px-4 py-2 rounded-full bg-slate-100 active:opacity-80"
            >
              <Text className="text-sm font-semibold text-slate-600">
                {FEED_MESSAGES.REMOVE_ALL_BUTTON}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  }

  return null;
}

export default React.memo(PostMomentPreview);

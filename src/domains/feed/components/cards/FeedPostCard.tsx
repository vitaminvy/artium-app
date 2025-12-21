import React, { useEffect, useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { FeedImageItem, FeedMedia, FeedPost, VideoPlayingChangePayload } from "../../types";
import { FEED_COLORS } from "../../constants";
import { shareArtwork } from "../../../../shared/utils/shareArtwork";
import { formatDuration } from "../../utils";
import { ANIMATION_CONFIG, MEDIA_CONFIG } from "../../constants/media";
import { FEED_MESSAGES } from "../../constants/messages";

type Props = {
  post: FeedPost;
  onPressLike: (id: string) => void;
  onPressReshare: (post: FeedPost) => void;
  onPressComment?: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
  onPressImage?: (images: { uri: string }[], index: number) => void;
  isVisible?: boolean;
};

function FeedPostCard({
  post,
  onPressLike,
  onPressReshare,
  onPressComment,
  onPressCard,
  onPressImage,
  isVisible = true,
}: Props) {
  const initials =
    post.author.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  const media = post.media;
  const isVideo = isVideoMedia(media);
  const isGallery = isImageGallery(media);
  const legacyImageSource = getLegacyImageSource(media);
  const player = useVideoPlayer(
    isVideo ? media.uri : null,
    (p) => {
      p.loop = false;
    }
  );
  const playButtonOpacity = useSharedValue(1);

  // Auto-play/pause video based on visibility
  useEffect(() => {
    if (!isVideo) return;

    if (isVisible) {
      // Auto-play when visible
      if (!player.playing) {
        player.play();
      }
    } else {
      // Auto-pause when not visible
      if (player.playing) {
        player.pause();
      }
    }
  }, [isVideo, isVisible, player]);

  useEffect(() => {
    const sub = player.addListener?.("playingChange", (payload: VideoPlayingChangePayload) => {
      const playing = !!payload?.isPlaying;
      playButtonOpacity.value = withTiming(playing ? 0 : 1, {
        duration: ANIMATION_CONFIG.VIDEO_BUTTON_FADE
      });
    });
    return () => {
      sub?.remove?.();
    };
  }, [player, playButtonOpacity]);

  const playButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: playButtonOpacity.value,
  }));

  const handlePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  }, [player]);

  const videoContainerStyle = useMemo(() => ({
    backgroundColor: media?.placeholderColor ?? MEDIA_CONFIG.PLACEHOLDER_COLOR_ALT,
    aspectRatio: media?.aspectRatio ?? MEDIA_CONFIG.DEFAULT_VIDEO_ASPECT_RATIO,
  }), [media?.placeholderColor, media?.aspectRatio]);

  const quoteMedia = post.quote?.media;
  const quoteImageSource = getLegacyImageSource(quoteMedia);
  const hasQuote = !!post.quote;
  const CardBody = () => (
    <View
      className="bg-white rounded-[28px] border px-4 py-3"
      style={[cardShadow, { borderColor: FEED_COLORS.CARD_BORDER }]}
    >
      {post.isReshare && post.resharedFrom ? (
        <View className="flex-row items-center gap-1 mb-2">
          <Ionicons name="repeat-outline" size={16} color="#0F172A" />
          <Text className="text-[12px] text-slate-600 font-medium">
            {post.author.name === "You" ? "You" : post.author.name} reshared
          </Text>
        </View>
      ) : null}

      <View className="flex-row items-center gap-3 mb-2">
        <View className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden items-center justify-center">
          {post.author.avatar ? (
            <Image
              source={{ uri: post.author.avatar }}
              className="h-full w-full"
            />
          ) : (
            <Text className="text-[13px] font-semibold text-slate-700">
              {initials}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <View
            className="flex-row items-center gap-2"
            style={{ flexShrink: 1 }}
          >
            <Text
              className="text-sm font-semibold text-slate-900"
              style={{ flexShrink: 1 }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {post.author.name}
            </Text>
            <Text className="text-xs text-slate-400">· {post.relativeTime}</Text>
          </View>
          <Text className="text-xs text-slate-500">@{post.author.handle}</Text>
        </View>
      </View>

      {post.content ? (
        <Text className="text-[14px] text-slate-900 leading-5 mb-3">
          {post.content}
        </Text>
      ) : null}

      {media ? (
        <View className="mb-3">
          {isVideo ? (
            <View
              className="rounded-2xl overflow-hidden"
              style={videoContainerStyle}
            >
              <VideoView
                pointerEvents="none"
                player={player}
                style={videoViewStyle}
                contentFit="cover"
                nativeControls={false}
                allowsFullscreen={false}
                allowsPictureInPicture={false}
              />
              <Pressable
                onPress={handlePlayPause}
                style={pressableOverlayStyle}
                hitSlop={0}
                android_ripple={undefined}
              >
                <Animated.View
                  className="absolute inset-0 items-center justify-center"
                  style={playButtonAnimatedStyle}
                  pointerEvents="none"
                >
                  <View className="h-14 w-14 rounded-full bg-black/55 items-center justify-center">
                    <Ionicons name="play" size={30} color="#fff" />
                  </View>
                </Animated.View>
              </Pressable>
              <View className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-black/55">
                <Text className="text-[11px] font-semibold text-white">
                  {formatDuration(media.durationMs) || FEED_MESSAGES.VIDEO_LABEL_FALLBACK}
                </Text>
              </View>
            </View>
          ) : isGallery ? (
            <MediaGrid
              items={media.items}
              placeholder={media.placeholderColor}
              onPressImage={onPressImage}
            />
          ) : legacyImageSource ? (
            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: media?.placeholderColor ?? MEDIA_CONFIG.PLACEHOLDER_COLOR_ALT,
                aspectRatio: media?.aspectRatio ?? MEDIA_CONFIG.SINGLE_IMAGE_ASPECT_RATIO,
              }}
            >
              <Image
                source={legacyImageSource}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      {hasQuote ? (
        <View className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 mb-3">
          <View className="flex-row items-center gap-2 mb-1">
            <View className="h-8 w-8 rounded-full bg-slate-200" />
            <View className="flex-1">
              <Text
                className="text-[13px] font-semibold text-slate-800"
                style={{ flexShrink: 1 }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {post.quote?.authorName}
              </Text>
              <Text className="text-[11px] text-slate-500">
                @{post.quote?.handle} · {post.quote?.relativeTime}
              </Text>
            </View>
          </View>
          <Text className="text-[13px] text-slate-800 leading-5 mb-2">
            {post.quote?.content}
          </Text>
          {quoteMedia && quoteImageSource ? (
            <View
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: quoteMedia.placeholderColor ?? "#E2E8F0",
                aspectRatio: quoteMedia.aspectRatio ?? 2,
              }}
            >
              <Image
                source={quoteImageSource}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <View className="flex-row items-center gap-6 pt-1">
        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => onPressLike(post.id, post.liked ?? false)}
          hitSlop={6}
        >
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={22}
            color={post.liked ? FEED_COLORS.LIKE_ACTIVE : FEED_COLORS.ICON}
          />
          <Text className="text-[13px] text-slate-600">
            {post.metrics.likes}
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => onPressReshare(post)}
          hitSlop={6}
        >
          <Ionicons
            name="repeat-outline"
            size={22}
            color={post.reshared ? FEED_COLORS.SHARE_ACTIVE : FEED_COLORS.ICON}
          />
          <Text className="text-[13px] text-slate-600">
            {post.metrics.shares}
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center gap-2"
          onPress={() => onPressComment?.(post)}
          hitSlop={6}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color={FEED_COLORS.ICON}
          />
          <Text className="text-[13px] text-slate-600">
            {post.metrics.comments}
          </Text>
        </Pressable>

        <Pressable
          className="flex-row items-center gap-2"
          hitSlop={6}
          onPress={() =>
            shareArtwork({
              title: post.content,
              artistName: post.author.name,
              marketing: "Khám phá tác phẩm này",
              deepLink: `https://www.artium.com/post/${post.id}`,
            })
          }
        >
          <Ionicons name="share-outline" size={22} color={FEED_COLORS.ICON} />
        </Pressable>
      </View>
    </View>
  );

  if (onPressCard) {
    return (
      <Pressable onPress={() => onPressCard(post)} className="mb-3 active:opacity-90">
        <CardBody />
      </Pressable>
    );
  }

  return (
    <View className="mb-3">
      <CardBody />
    </View>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 6,
};

const videoViewStyle: StyleProp<ViewStyle> = StyleSheet.absoluteFillObject;

const pressableOverlayStyle: StyleProp<ViewStyle> = StyleSheet.absoluteFillObject;

const areEqual = (prev: Props, next: Props) =>
  prev.post === next.post &&
  prev.onPressLike === next.onPressLike &&
  prev.onPressReshare === next.onPressReshare &&
  prev.onPressComment === next.onPressComment &&
  prev.onPressCard === next.onPressCard &&
  prev.onPressImage === next.onPressImage &&
  prev.isVisible === next.isVisible;

export default React.memo(FeedPostCard, areEqual);

const isVideoMedia = (media?: FeedMedia): media is Extract<FeedMedia, { type: "video" }> =>
  !!media && media.type === "video" && typeof media.uri === "string";

const isImageGallery = (
  media?: FeedMedia
): media is Extract<FeedMedia, { type: "image"; items: FeedImageItem[] }> =>
  !!media &&
  media.type === "image" &&
  "items" in media &&
  Array.isArray((media as any).items);

const getLegacyImageSource = (media?: FeedMedia) => {
  if (!media) return undefined;
  if ("url" in media && media.url) {
    return typeof media.url === "number" ? media.url : { uri: media.url };
  }
  return undefined;
};

type MediaGridProps = {
  items: FeedImageItem[];
  placeholder?: string;
  onPressImage?: (images: { uri: string }[], index: number) => void;
};

function MediaGrid({ items, placeholder, onPressImage }: MediaGridProps) {
  if (!items.length) return null;
  const normalized = items.map((item) =>
    typeof item === "string" ? { uri: item } : item
  );

  if (normalized.length === 1) {
    const item = normalized[0];
    return (
      <Pressable
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: placeholder ?? "#CBD5E1",
          aspectRatio: 0.85,
        }}
        onPress={() => onPressImage?.(normalized, 0)}
      >
        <Image
          source={{ uri: item.uri }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
      </Pressable>
    );
  }

  // Special layout for exactly 3 images: first image on left (full height), 2 images stacked on right
  if (normalized.length === 3) {
    return (
      <View className="flex-row gap-2">
        <Pressable
          style={{
            width: "48.5%",
            aspectRatio: 0.75,
            backgroundColor: placeholder ?? "#CBD5E1",
            borderRadius: 16,
            overflow: "hidden",
          }}
          onPress={() => onPressImage?.(normalized, 0)}
        >
          <Image
            source={{ uri: normalized[0].uri }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={0}
            cachePolicy="memory-disk"
          />
        </Pressable>
        <View className="flex-1 gap-2">
          <Pressable
            style={{
              flex: 1,
              backgroundColor: placeholder ?? "#CBD5E1",
              borderRadius: 16,
              overflow: "hidden",
            }}
            onPress={() => onPressImage?.(normalized, 1)}
          >
            <Image
              source={{ uri: normalized[1].uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
            />
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: placeholder ?? "#CBD5E1",
              borderRadius: 16,
              overflow: "hidden",
            }}
            onPress={() => onPressImage?.(normalized, 2)}
          >
            <Image
              source={{ uri: normalized[2].uri }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={0}
              cachePolicy="memory-disk"
            />
          </Pressable>
        </View>
      </View>
    );
  }

  const displayItems = normalized.slice(0, 4);
  const extra = normalized.length - displayItems.length;

  return (
    <View className="rounded-2xl overflow-hidden">
      <View className="flex-row flex-wrap gap-2">
        {displayItems.map((item, idx) => {
          const isLast = idx === displayItems.length - 1;
          const showExtra = isLast && extra > 0;
          return (
            <Pressable
              key={`${item.uri}-${idx}`}
              style={{
                width: "48%",
                aspectRatio: 1,
                backgroundColor: placeholder ?? "#CBD5E1",
                borderRadius: 12,
                overflow: "hidden",
                position: "relative",
              }}
              onPress={() => onPressImage?.(normalized, idx)}
            >
              <Image
                source={{ uri: item.uri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={0}
                cachePolicy="memory-disk"
              />
              {showExtra ? (
                <View className="absolute inset-0 bg-black/55 items-center justify-center">
                  <Text className="text-xl font-bold text-white">+{extra}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

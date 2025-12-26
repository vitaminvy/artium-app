import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import type { BlogArticle } from "../types";

type Props = {
  data: BlogArticle[];
  onPressItem?: (item: BlogArticle) => void;
};

export default function BlogHeroCarousel({ data, onPressItem }: Props) {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  if (!data.length) return null;

  const cardWidth = Math.min(width - 32, 430);
  const cardHeight = Math.round(cardWidth * 1.08);

  return (
    <View className="mt-2">
      <Carousel
        data={data}
        width={cardWidth}
        height={cardHeight}
        loop
        autoPlay
        autoPlayInterval={5200}
        pagingEnabled
        mode="horizontal-stack"
        modeConfig={{
          snapDirection: "left",
          stackInterval: 14,
          scaleInterval: 0.06,
        }}
        scrollAnimationDuration={720}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={({ item }) => (
          <HeroCard
            item={item}
            width={cardWidth}
            height={cardHeight}
            onPress={() => onPressItem?.(item)}
          />
        )}
      />

      <View className="mt-4 flex-row items-center justify-center">
        {data.map((_, index) => (
          <PaginationDot key={index} index={index} progress={progress} />
        ))}
      </View>
    </View>
  );
}

function HeroCard({
  item,
  width,
  height,
  onPress,
}: {
  item: BlogArticle;
  width: number;
  height: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className="overflow-hidden rounded-[28px] bg-[#0b1224]"
      style={{ width, height }}
      onPress={onPress}
    >
      <Image
        source={{ uri: item.coverImage }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View className="absolute inset-0 bg-black/25" />

      <View className="absolute inset-x-5 top-5 flex-row items-center gap-2">
        <Pill label={item.tag ?? "Blog"} />
        {item.category ? <Pill label={item.category} muted /> : null}
      </View>

      <View className="absolute inset-x-4 bottom-4">
        <View className="rounded-2xl bg-white/12 p-4 border border-white/10">
          <Text
            className="text-white text-[22px] font-extrabold leading-7"
            numberOfLines={2}
          >
            {item.title}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 overflow-hidden rounded-full border border-white/25 bg-white/10">
                <Image
                  source={{ uri: item.authorAvatar }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              </View>
              <View>
                <Text className="text-white text-[13px] font-semibold">
                  {item.authorName}
                </Text>
                <Text className="text-white/80 text-[11px]">
                  {new Date(item.publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {item.readTimeMinutes} mins read
                </Text>
              </View>
            </View>

            <View className="h-10 w-10 items-center justify-center rounded-full bg-white/90">
              <Ionicons name="arrow-forward" size={18} color="#0F172A" />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function PaginationDot({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);

    return {
      width: interpolate(distance, [0, 1], [30, 12], Extrapolate.CLAMP),
      opacity: interpolate(distance, [0, 1], [1, 0.4], Extrapolate.CLAMP),
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          backgroundColor: "#111827",
          borderRadius: 999,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

function Pill({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <View
      className="rounded-full px-3 py-[6px]"
      style={{
        backgroundColor: muted ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.32)",
      }}
    >
      <Text
        className="text-[12px] font-semibold uppercase tracking-[0.5px]"
        style={{ color: muted ? "#E2E8F0" : "#FFFFFF" }}
      >
        {label}
      </Text>
    </View>
  );
}

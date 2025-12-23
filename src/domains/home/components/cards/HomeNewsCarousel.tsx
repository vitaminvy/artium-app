import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { HomeNewsItem } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

type Props = {
  data: HomeNewsItem[];
  onPressItem?: (item: HomeNewsItem) => void;
};

export default function HomeNewsCarousel({ data, onPressItem }: Props) {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  if (!data.length) return null;

  const cardWidth = width - 32;
  const cardHeight = Math.round(cardWidth * 0.6);

  return (
    <View className="rounded-3xl bg-white" style={cardShadow}>
      <Carousel
        width={cardWidth}
        height={cardHeight}
        data={data}
        loop={data.length > 1}
        autoPlay={data.length > 1}
        autoPlayInterval={4500}
        scrollAnimationDuration={500}
        onProgressChange={(_, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={({ item }) => (
          <NewsCard
            item={item}
            width={cardWidth}
            height={cardHeight}
            onPress={onPressItem}
          />
        )}
      />

      <View className="flex-row items-center justify-center py-3">
        {data.map((_, index) => (
          <PaginationDot key={index} index={index} progress={progress} />
        ))}
      </View>
    </View>
  );
}

function NewsCard({
  item,
  width,
  height,
  onPress,
}: {
  item: HomeNewsItem;
  width: number;
  height: number;
  onPress?: (item: HomeNewsItem) => void;
}) {
  return (
    <Pressable
      className="rounded-3xl overflow-hidden bg-slate-200"
      style={{ width, height, borderWidth: 1, borderColor: "#E2E8F0" }}
      onPress={() => onPress?.(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width, height }}
        contentFit="cover"
        transition={0}
        cachePolicy="memory-disk"
      />

      <View className="absolute inset-0">
        <View className="absolute top-3 left-3 flex-row items-center gap-2">
          <View className="rounded-full px-3 py-1 bg-black/45">
            <Text className="text-[11px] font-semibold text-white">
              {item.tag ?? "NEWS"}
            </Text>
          </View>
          <View className="rounded-full px-3 py-1 bg-black/45">
            <Text className="text-[11px] font-semibold text-white">
              {item.dateLabel}
            </Text>
          </View>
        </View>

        <View className="absolute left-4 right-4 bottom-4">
          <Text
            className="text-[18px] font-semibold text-white leading-6"
            numberOfLines={3}
          >
            {item.title}
          </Text>

          <View className="mt-3 flex-row justify-end">
            <View className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2">
              <Text className="text-[12px] font-semibold text-slate-900">
                READ NOW
              </Text>
              <Ionicons name="arrow-forward" size={14} color="#0F172A" />
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
      width: interpolate(distance, [0, 1], [22, 8], Extrapolate.CLAMP),
      height: 8,
      opacity: interpolate(distance, [0, 1], [1, 0.35], Extrapolate.CLAMP),
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: "#0B73FF",
          borderRadius: 4,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
}

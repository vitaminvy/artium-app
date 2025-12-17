import React, { useState } from "react";
import { View, Image, Dimensions, ViewStyle } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const cardShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

type ArtworkCarouselProps = {
  images: string[];
};

export default function ArtworkCarousel({ images }: ArtworkCarouselProps) {
  const progress = useSharedValue(0);
  const CAROUSEL_WIDTH = SCREEN_WIDTH - 32; // padding 16px each side
  const ITEM_WIDTH = CAROUSEL_WIDTH - 64; // minus padding and spacing
  const CAROUSEL_HEIGHT = ITEM_WIDTH * 1.1; // 1:1.1 ratio

  return (
    <View
      className="rounded-3xl overflow-hidden"
      style={[
        cardShadow,
        {
          backgroundColor: "#F8FAFC",
          padding: 16,
        },
      ]}
    >
      <View
        className="rounded-2xl overflow-hidden"
        style={{ backgroundColor: "transparent" }}
      >
        <Carousel
          width={CAROUSEL_WIDTH - 32}
          height={CAROUSEL_HEIGHT}
          data={images}
          loop={images.length > 1}
          autoPlay={false}
          scrollAnimationDuration={400}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item, index }) => (
            <CarouselItem
              item={item}
              index={index}
              progress={progress}
              width={ITEM_WIDTH}
              height={CAROUSEL_HEIGHT}
            />
          )}
        />
      </View>

      <View className="flex-row items-center justify-center pt-4">
        {images.map((_, index) => (
          <PaginationDot key={index} index={index} progress={progress} />
        ))}
      </View>
    </View>
  );
}

function CarouselItem({
  item,
  index,
  progress,
  width,
  height,
}: {
  item: string;
  index: number;
  progress: SharedValue<number>;
  width: number;
  height: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);

    return {
      opacity: interpolate(
        distance,
        [0, 0.5, 1],
        [1, 0.7, 0.3],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          scale: interpolate(distance, [0, 1], [1, 0.92], Extrapolate.CLAMP),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 8,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
          width,
          height,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <Image
          source={{ uri: item }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </View>
    </Animated.View>
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
      width: interpolate(distance, [0, 1], [24, 8], Extrapolate.CLAMP),
      height: 8,
      opacity: interpolate(distance, [0, 1], [1, 0.4], Extrapolate.CLAMP),
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

// Detailed Artwork Screen inspired by provided design
// src/screens/ArtworkDetailScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

import { discoverMockData } from "../domains/discover/mockData";
import { Artwork } from "../domains/discover/types";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ArtworkDetail = {
  id: string;
  title: string;
  artist: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  stats: {
    worksSold: number;
    buyers: number;
  };
  price: string;
  availabilityNote?: string;
  images: string[];
  tags: string[];
  dimension: { h: number; w: number; d: number; unit: string };
  weight: string;
  year: number;
  edition: number;
  materials: string;
  shipping: { title: string; subtitle?: string }[];
};

const fallbackDetail: ArtworkDetail = {
  id: "aw-1",
  title: "August",
  artist: {
    name: "Jeff Yarrington",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  stats: {
    worksSold: 4,
    buyers: 3,
  },
  price: "USD $550",
  availabilityNote: "Only 1 available. Get yours now!",
  images: [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  ],
  tags: [
    "Joyful",
    "Natural",
    "Vibrant",
    "Expressive",
    "Peaceful",
    "Bold",
    "Moody",
    "Minimalist",
    "Vintage",
    "Spiritual",
    "Painting",
    "Human Experience",
    "Futurism",
    "Environment",
    "Escapism",
    "Universal",
  ],
  dimension: { h: 24, w: 30, d: 2, unit: "in" },
  weight: "8.00 lbs",
  year: 2025,
  edition: 1,
  materials: "Acrylic on canvas with real wood floating frame",
  shipping: [
    { title: "Shipped within 7 working days in a box" },
    { title: "Cohart Satisfaction Guarantee" },
  ],
};

export default function ArtworkDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { hidden, setHidden, height: tabHeight } = useTabBarVisibility();
  const scrollY = useRef(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const actionBottom = useRef(new RNAnimated.Value(tabHeight + 12)).current;

  const currentArtwork: Artwork | undefined = useMemo(() => {
    const all = [
      ...discoverMockData.artworks,
      ...discoverMockData.moments,
    ];
    return all.find((item) => item.id === route?.params?.id);
  }, [route?.params?.id]);

  const detail: ArtworkDetail = useMemo(() => {
    if (!currentArtwork) return fallbackDetail;
    return {
      ...fallbackDetail,
      id: currentArtwork.id,
      title: currentArtwork.title,
      artist: {
        name: currentArtwork.artist,
        avatar:
          currentArtwork.artistAvatar ??
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
        verified: true,
      },
      price: currentArtwork.price ?? fallbackDetail.price,
      images: [
        currentArtwork.image,
        ...fallbackDetail.images.slice(1),
      ],
    };
  }, [currentArtwork]);

  const similarWorks = useMemo(
    () =>
      discoverMockData.artworks
        .filter((item) => item.id !== detail.id)
        .slice(0, 6),
    [detail.id]
  );

  useEffect(() => {
    const targetBottom = hidden
      ? Math.max(insets.bottom + 12, 12)
      : tabHeight + 12;

    RNAnimated.spring(actionBottom, {
      toValue: targetBottom,
      useNativeDriver: false,
      damping: 16,
      stiffness: 200,
    }).start();
  }, [hidden, tabHeight, insets.bottom, actionBottom]);

  useEffect(
    () => () => {
      setHidden(false);
    },
    [setHidden]
  );

  const handleScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    const diff = y - scrollY.current;
    if (Math.abs(diff) > 8) {
      if (diff > 0 && !hidden) {
        setHidden(true);
      } else if (diff < 0 && hidden) {
        setHidden(false);
      }
    }
    scrollY.current = y;
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center justify-between px-4 border-b border-slate-100"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <Pressable
          className="h-10 w-10 items-center justify-center"
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>
        <View className="flex-row items-center gap-3">
          <Pressable className="h-10 w-10 items-center justify-center">
            <Ionicons name="share-outline" size={22} color="#0F172A" />
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center">
            <Ionicons name="ellipsis-vertical" size={22} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + tabHeight + 160, 220),
        }}
      >
        <View className="px-4 pt-4">
          <ArtworkCarousel images={detail.images} />
        </View>

        <View className="px-4 pt-6">
          <Text className="text-2xl font-bold text-slate-900">
            {detail.title}
          </Text>

          <View className="flex-row items-center gap-3 mt-3">
            <View className="h-12 w-12 rounded-full overflow-hidden bg-slate-200">
              <Image
                source={{ uri: detail.artist.avatar }}
                className="h-full w-full"
              />
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-base font-semibold text-slate-900">
                {detail.artist.name}
              </Text>
              {detail.artist.verified ? (
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              ) : null}
            </View>
          </View>

          <View className="flex-row items-center gap-4 mt-4">
            <View className="flex-row items-center gap-1">
              <Ionicons name="pricetag-outline" size={16} color="#94A3B8" />
              <Text className="text-sm text-slate-500">
                {detail.stats.worksSold} works sold
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="people-outline" size={16} color="#94A3B8" />
              <Text className="text-sm text-slate-500">
                {detail.stats.buyers} buyers
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-5 border-b border-slate-100" />

        <View className="px-4 py-5 gap-3">
          <View className="flex-row items-center gap-3">
            <View className="h-3 w-3 rounded-full bg-[#0B73FF]" />
            <Text className="text-xl font-extrabold text-slate-900">
              {detail.price}
            </Text>
          </View>
          <Pressable className="flex-row items-center gap-2">
            <Ionicons name="information-circle-outline" size={16} color="#0B73FF" />
            <Text className="text-sm font-semibold text-[#0B73FF]">
              View Price Graph
            </Text>
            <Ionicons name="chevron-forward" size={14} color="#0B73FF" />
          </Pressable>
          {detail.availabilityNote ? (
            <Text className="text-base italic text-slate-600 mt-1">
              {detail.availabilityNote}
            </Text>
          ) : null}
        </View>

        <View className="px-4 pb-5">
          <View className="flex-row gap-3">
            {detail.shipping.map((item, idx) => (
              <View
                key={idx}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4"
                style={cardShadow}
              >
                <Text className="text-sm font-semibold text-slate-900">
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text className="text-xs text-slate-500 mt-1">
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View className="px-4 py-2">
          <Text className="text-sm font-semibold text-slate-600 mb-3">
            ABOUT THE ARTWORK
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {detail.tags.map((tag) => (
              <View
                key={tag}
                className="px-4 py-2 rounded-full border border-slate-300"
              >
                <Text className="text-sm font-semibold text-slate-800 uppercase">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-4 py-6">
          <View className="flex-row gap-6">
            <InfoBlock
              label="Dimension: (H X W X D)"
              value={`${detail.dimension.h.toFixed(2)} × ${detail.dimension.w.toFixed(2)} × ${detail.dimension.d.toFixed(2)} ${detail.dimension.unit}`}
            />
            <InfoBlock label="Weight:" value={detail.weight} />
          </View>
          <View className="flex-row gap-6 mt-5">
            <InfoBlock
              label="Year / Total Edition Run:"
              value={`${detail.year} / ${detail.edition}`}
            />
          </View>
          <View className="mt-6">
            <Text className="text-xs font-semibold text-slate-500 uppercase">
              Materials:
            </Text>
            <Text className="text-base text-slate-900 mt-2">
              {detail.materials}
            </Text>
          </View>
        </View>

        <View className="px-4 pb-4">
          <Text className="text-xl font-semibold text-slate-900 mb-3">
            Similar Works
          </Text>
          <FlatList
            data={similarWorks}
            horizontal
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <SimilarCard
                item={item}
                onPress={() =>
                  (navigation.navigate as any)("ArtworkDetail", { id: item.id })
                }
              />
            )}
            contentContainerStyle={{ paddingRight: 16 }}
          />
        </View>
      </ScrollView>

      <RNAnimated.View
        className="absolute left-4 right-4 rounded-full bg-white border border-slate-200 flex-row items-center px-3"
        style={[
          actionBarShadow,
          {
            bottom: actionBottom,
            paddingVertical: 10,
          },
        ]}
        pointerEvents="box-none"
      >
        <View className="flex-row items-center gap-4 flex-1 pl-1">
          <IconButton
            icon={liked ? "heart" : "heart-outline"}
            color={liked ? "#EF4444" : "#0F172A"}
            onPress={() => setLiked((prev) => !prev)}
          />
          <IconButton
            icon="swap-horizontal-outline"
            onPress={() => {}}
          />
          <IconButton
            icon={saved ? "bookmark" : "bookmark-outline"}
            onPress={() => setSaved((prev) => !prev)}
          />
        </View>
        <Pressable className="bg-[#0B73FF] px-5 py-3 rounded-full flex-row items-center gap-2 active:opacity-90">
          <Ionicons name="cart-outline" size={18} color="#ffffff" />
          <Text className="text-white font-semibold">Buy now</Text>
        </Pressable>
      </RNAnimated.View>
    </View>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-xs font-semibold text-slate-500 uppercase">
        {label}
      </Text>
      <Text className="text-base font-semibold text-slate-900 mt-1">
        {value}
      </Text>
    </View>
  );
}

function IconButton({
  icon,
  onPress,
  color = "#0F172A",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 rounded-full items-center justify-center active:opacity-80"
    >
      <Ionicons name={icon} size={22} color={color} />
    </Pressable>
  );
}

function ArtworkCarousel({ images }: { images: string[] }) {
  const progress = useSharedValue(0);
  const CAROUSEL_WIDTH = SCREEN_WIDTH - 32; // padding 16px mỗi bên
  const ITEM_WIDTH = CAROUSEL_WIDTH - 64; // trừ padding và spacing
  const CAROUSEL_HEIGHT = ITEM_WIDTH * 1.1; // tỷ lệ 1:1.1

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
      {/* Carousel container với bo góc */}
      <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'transparent' }}>
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

      {/* Pagination dots */}
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
          scale: interpolate(
            distance,
            [0, 1],
            [1, 0.92],
            Extrapolate.CLAMP
          ),
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
          width: width,
          height: height,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <Image
          source={{ uri: item }}
          style={{
            width: "100%",
            height: "100%",
          }}
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

function SimilarCard({
  item,
  onPress,
}: {
  item: Artwork;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-48 rounded-2xl border border-slate-200 bg-white"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="h-44 w-full rounded-t-2xl"
        resizeMode="cover"
      />
      <View className="px-3 py-3 gap-1">
        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden">
            {item.artistAvatar ? (
              <Image source={{ uri: item.artistAvatar }} className="h-full w-full" />
            ) : null}
          </View>
          <Text className="text-xs font-semibold text-slate-700" numberOfLines={1}>
            {item.artist}
          </Text>
        </View>
        <Text className="text-sm font-semibold text-slate-900" numberOfLines={2}>
          {item.title}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          <View className="h-2.5 w-2.5 rounded-full bg-[#0B73FF]" />
          <Text className="text-sm font-semibold text-slate-900">
            {item.price ?? "$500"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const cardShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

const actionBarShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 10,
  elevation: 6,
};

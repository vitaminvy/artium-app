// Detailed Artwork Screen inspired by provided design
// src/screens/ArtworkDetailScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated as RNAnimated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { discoverMockData } from "../domains/discover/mockData";
import { Artwork } from "../domains/discover/types";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import ReshareSheet from "../domains/feed/components/sheets/ReshareSheet";
import { FeedPost } from "../domains/feed/types";

// Domain Imports
import { ArtworkDetail } from "../domains/artwork/types";
import { fallbackDetail } from "../domains/artwork/mockData";
import SaveSheet from "../domains/artwork/components/SaveSheet";
import ReportSheet from "../domains/artwork/components/ReportSheet";
import OptionsSheet from "../domains/artwork/components/OptionsSheet";
import ArtworkCarousel from "../domains/artwork/components/ArtworkCarousel";
import SimilarCard from "../domains/artwork/components/cards/SimilarCard";
import IconButton from "../domains/artwork/components/ui/IconButton";
import { InfoBlock, InfoBlockWithConvert } from "../domains/artwork/components/ui/InfoBlock";

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

export default function ArtworkDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { hidden, setHidden, height: tabHeight } = useTabBarVisibility();
  const scrollY = useRef(0);
  const [liked, setLiked] = useState(false);
  const [savedBoardId, setSavedBoardId] = useState<string | null>(null);
  const saved = !!savedBoardId;
  const [reshared, setReshared] = useState(false);
  const actionBottom = useRef(new RNAnimated.Value(tabHeight + 12)).current;
  const [showDimensionConvert, setShowDimensionConvert] = useState(false);
  const [showWeightConvert, setShowWeightConvert] = useState(false);
  const [showReshareSheet, setShowReshareSheet] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const optionsSheetRef = useRef<BottomSheetModal>(null);

  const currentArtwork: Artwork | undefined = useMemo(() => {
    const all = [...discoverMockData.artworks, ...discoverMockData.moments];
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
      images: [currentArtwork.image, ...fallbackDetail.images.slice(1)],
    };
  }, [currentArtwork]);

  const similarWorks = useMemo(
    () =>
      discoverMockData.artworks
        .filter((item) => item.id !== detail.id)
        .slice(0, 6),
    [detail.id]
  );
  const dimensionInLabel = `${detail.dimension.h.toFixed(
    2
  )} × ${detail.dimension.w.toFixed(2)} × ${detail.dimension.d.toFixed(2)} in`;
  const dimensionCmLabel = `${(detail.dimension.h * 2.54).toFixed(2)} × ${(
    detail.dimension.w * 2.54
  ).toFixed(2)} × ${(detail.dimension.d * 2.54).toFixed(2)} cm`;
  const weightLbLabel = detail.weight;
  const weightKgLabel = `${(parseFloat(detail.weight) * 0.45359237).toFixed(
    2
  )} kg`;
  const reshareTarget: FeedPost = useMemo(
    () => ({
      id: detail.id,
      author: {
        id: detail.artist.name,
        name: detail.artist.name,
        handle: detail.artist.name.replace(/\s+/g, "").toLowerCase(),
        avatar: detail.artist.avatar,
        verified: detail.artist.verified,
      },
      content: `${detail.title} · ${detail.price}`,
      createdAt: Date.now(),
      relativeTime: "Just now",
      media: {
        url: detail.images[0],
        aspectRatio: 3 / 3,
        placeholderColor: "#CBD5E1",
      },
      metrics: { likes: 0, comments: 0, shares: 0 },
    }),
    [detail]
  );

  useEffect(() => {
    const targetBottom = hidden
      ? Math.max(insets.bottom + 6, 6) // Khi tab ẩn: dính sát mép dưới/safe area
      : tabHeight + 4; // Khi tab hiện: nằm ngay trên tab

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

  const handleOpenOptionsSheet = () => {
    setShowOptionsSheet(true);
    // Ensure the modal is presented even if state was already true
    optionsSheetRef.current?.present();
  };

  const handleCloseOptionsSheet = () => {
    setShowOptionsSheet(false);
    optionsSheetRef.current?.dismiss();
  };

  const handleOptionsSheetChange = useCallback(
    (open: boolean) => setShowOptionsSheet(open),
    []
  );

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-white">
        <View
          className="flex-row items-center justify-between px-4 border-b border-slate-100 bg-white"
          style={{ paddingTop: insets.top + 8, paddingBottom: 12, zIndex: 50 }}
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
            <Pressable
              className="h-10 w-10 items-center justify-center"
              hitSlop={8}
              onPress={handleOpenOptionsSheet}
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#0F172A" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Math.max(insets.bottom + tabHeight + 10, 80),
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
              <InfoBlockWithConvert
                label="Dimension: (H X W X D)"
                value={`${dimensionInLabel}`}
                convertLabel="This is equivalent to:"
                convertValue={dimensionCmLabel}
                visible={showDimensionConvert}
                onToggle={() => setShowDimensionConvert((prev) => !prev)}
              />
              <InfoBlockWithConvert
                label="Weight:"
                value={weightLbLabel}
                convertLabel="This is equivalent to:"
                convertValue={weightKgLabel}
                visible={showWeightConvert}
                onToggle={() => setShowWeightConvert((prev) => !prev)}
              />
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
                    // Use push to force a fresh detail screen even when already on this route
                    navigation.push(
                      "ArtworkDetail" as never,
                      { id: item.id } as never
                    )
                  }
                />
              )}
              contentContainerStyle={{ paddingRight: 16 }}
            />
          </View>
        </ScrollView>

        <RNAnimated.View
          className="absolute left-3 right-3 rounded-full bg-white border border-slate-200 flex-row items-center px-3"
          style={[
            actionBarShadow,
            {
              bottom: actionBottom,
              paddingVertical: 7,
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
              icon="repeat-outline"
              color={reshared ? "#0B73FF" : "#0F172A"}
              bg={reshared ? "rgba(11,115,255,0.08)" : undefined}
              onPress={() => setShowReshareSheet(true)}
            />
            <IconButton
              icon={saved ? "bookmark" : "bookmark-outline"}
              color={saved ? "#0B73FF" : "#0F172A"}
              onPress={() => {
                setShowSaveSheet(true);
              }}
            />
          </View>
          <Pressable className="bg-[#0B73FF] px-5 py-3 rounded-full flex-row items-center gap-2 active:opacity-90">
            <Ionicons name="cart-outline" size={18} color="#ffffff" />
            <Text className="text-white font-semibold">Buy now</Text>
          </Pressable>
        </RNAnimated.View>

        <ReshareSheet
          visible={showReshareSheet}
          target={reshareTarget}
          onClose={() => setShowReshareSheet(false)}
          onSubmit={(text) => {
            setShowReshareSheet(false);
            console.log("Reshare from artwork detail", detail.id, text);
            setReshared(true);
          }}
        />

        <SaveSheet
          visible={showSaveSheet}
          onClose={() => setShowSaveSheet(false)}
          initialSelectedId={savedBoardId}
          onSelect={(id) => {
            setSavedBoardId(id);
            setShowSaveSheet(false);
          }}
        />

        {/* Options Sheet */}
        <OptionsSheet
          ref={optionsSheetRef}
          visible={showOptionsSheet}
          onClose={handleCloseOptionsSheet}
          onReport={() => {
            handleCloseOptionsSheet();
            setShowReportSheet(true);
          }}
          onChange={handleOptionsSheetChange}
        />

        <ReportSheet
          visible={showReportSheet}
          onClose={() => setShowReportSheet(false)}
          onReport={(reason, msg) => {
            setShowReportSheet(false);
            console.log("Reported artwork", detail.id, reason, msg);
          }}
        />
      </View>
    </BottomSheetModalProvider>
  );
}
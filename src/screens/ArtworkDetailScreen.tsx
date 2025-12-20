// Detailed Artwork Screen
// src/screens/ArtworkDetailScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated as RNAnimated,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetModalProvider, BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";

import { discoverMockData } from "../domains/discover/mockData";
import { Artwork as DiscoverArtwork } from "../domains/discover/types";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import ReshareSheet from "../domains/feed/components/sheets/ReshareSheet";
import { FeedPost } from "../domains/feed/types";
import { Artwork as InventoryArtwork } from "../domains/inventory/types";

// Domain Imports
import { ArtworkDetail } from "../domains/artwork/types";
import { fallbackDetail } from "../domains/artwork/mockData";
import SaveSheet from "../domains/artwork/components/SaveSheet";
import ReportSheet from "../domains/artwork/components/ReportSheet";
import ArtworkCarousel from "../domains/artwork/components/ArtworkCarousel";
import SimilarCard from "../domains/artwork/components/cards/SimilarCard";
import { shareArtwork } from "../shared/utils/shareArtwork";

// New Components
import ArtworkHeader from "../domains/artwork/components/ArtworkHeader";
import ArtworkInfo from "../domains/artwork/components/ArtworkInfo";
import ArtworkDetails from "../domains/artwork/components/ArtworkDetails";
import ArtworkActionBar from "../domains/artwork/components/ArtworkActionBar";

export default function ArtworkDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { hidden, setHidden, height: tabHeight } = useTabBarVisibility();
  const scrollY = useRef(0);

  // States
  const [liked, setLiked] = useState(false);
  const [savedBoardId, setSavedBoardId] = useState<string | null>(null);
  const saved = !!savedBoardId;
  const [reshared, setReshared] = useState(false);
  const actionBottom = useRef(new RNAnimated.Value(tabHeight + 12)).current;
  const [showReshareSheet, setShowReshareSheet] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);

  // Bottom Sheet Refs
  const optionsSheetRef = useRef<BottomSheetModal>(null);

  const inventoryArtwork: InventoryArtwork | undefined = route?.params?.artwork;

  const currentArtwork: DiscoverArtwork | undefined = useMemo(() => {
    if (inventoryArtwork) return undefined;
    const all = [...discoverMockData.artworks, ...discoverMockData.moments];
    return all.find((item) => item.id === route?.params?.id);
  }, [route?.params?.id, inventoryArtwork]);

  const detail: ArtworkDetail = useMemo(() => {
    if (inventoryArtwork) {
      const images =
        inventoryArtwork.images && inventoryArtwork.images.length > 0
          ? inventoryArtwork.images
          : [inventoryArtwork.thumbnail];
      return {
        ...fallbackDetail,
        id: inventoryArtwork.id,
        title: inventoryArtwork.title,
        artist: {
          name: inventoryArtwork.artist,
          avatar: fallbackDetail.artist.avatar,
          verified: false,
        },
        price: inventoryArtwork.price ?? fallbackDetail.price,
        images,
      };
    }
    if (currentArtwork) {
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
    }
    return fallbackDetail;
  }, [currentArtwork, inventoryArtwork]);

  const similarWorks = useMemo(() => {
    if (inventoryArtwork) return [];
    return discoverMockData.artworks
      .filter((item) => item.id !== detail.id)
      .slice(0, 6);
  }, [detail.id, inventoryArtwork]);

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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.4}
      />
    ),
    []
  );

  // Action bottom animation
  useEffect(() => {
    const targetBottom = hidden
      ? Math.max(insets.bottom + 6, 6)
      : tabHeight + 4;

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

  // Sheet handlers
  const handleOpenOptionsSheet = useCallback(() => {
    setHidden(true);
    optionsSheetRef.current?.present();
  }, [setHidden]);

  const handleOpenSaveSheet = useCallback(() => {
    setHidden(true);
    setShowSaveSheet(true);
  }, [setHidden]);

  const handleOpenReshareSheet = useCallback(() => {
    setHidden(true);
    setShowReshareSheet(true);
  }, [setHidden]);

  const handleOpenReportSheet = useCallback(() => {
    optionsSheetRef.current?.dismiss();
    setTimeout(() => {
      setShowReportSheet(true);
    }, 300);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setHidden(false);
  }, [setHidden]);

  const handleShare = useCallback(async () => {
    try {
      await shareArtwork({
        title: detail.title,
        artistName: detail.artist.name,
        marketing: "Khám phá tác phẩm này",
        deepLink: `https://www.artium.com/artwork/${detail.id}`,
      });
    } catch (err) {
      Alert.alert("Share unavailable", "Không thể mở chia sẻ trên thiết bị này.");
    }
  }, [detail]);

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-white">
        {/* Custom Header */}
        <ArtworkHeader
          onBack={() => navigation.goBack()}
          onShare={handleShare}
          onOptions={handleOpenOptionsSheet}
        />

        {/* Content */}
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

          <ArtworkInfo detail={detail} />
          <ArtworkDetails detail={detail} />

          {/* Similar Works */}
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

        {/* Action Bar */}
        <ArtworkActionBar
          liked={liked}
          saved={saved}
          reshared={reshared}
          actionBottom={actionBottom}
          onLike={() => setLiked((prev) => !prev)}
          onReshare={handleOpenReshareSheet}
          onSave={handleOpenSaveSheet}
        />

        {/* Reshare Sheet */}
        <ReshareSheet
          visible={showReshareSheet}
          target={reshareTarget}
          onClose={() => {
            setShowReshareSheet(false);
            handleCloseSheet();
          }}
          onSubmit={() => {
            setShowReshareSheet(false);
            handleCloseSheet();
            setReshared(true);
          }}
        />

        {/* Save Sheet */}
        <SaveSheet
          visible={showSaveSheet}
          onClose={() => {
            setShowSaveSheet(false);
            handleCloseSheet();
          }}
          initialSelectedId={savedBoardId}
          onSelect={(id) => {
            setSavedBoardId(id);
            setShowSaveSheet(false);
            handleCloseSheet();
          }}
        />

        {/* Options Sheet */}
        <BottomSheetModal
          ref={optionsSheetRef}
          snapPoints={[200]}
          backdropComponent={renderBackdrop}
          enablePanDownToClose
          handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40, height: 4 }}
          backgroundStyle={{ backgroundColor: "white" }}
          enableDynamicSizing={false}
          onDismiss={handleCloseSheet}
        >
          <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
            <Text className="text-lg font-bold text-slate-900 px-5 pt-2 pb-3">
              Options
            </Text>
            <Pressable
              onPress={handleOpenReportSheet}
              className="flex-row items-center gap-3 px-5 py-4 active:bg-slate-50"
              style={{ backgroundColor: 'transparent' }}
            >
              <Ionicons name="alert-outline" size={24} color="#0F172A" />
              <Text className="text-base font-semibold text-slate-900">Report Artwork</Text>
            </Pressable>
          </View>
        </BottomSheetModal>

        {/* Report Sheet */}
        <ReportSheet
          visible={showReportSheet}
          onClose={() => {
            setShowReportSheet(false);
            handleCloseSheet();
          }}
          onReport={() => {
            setShowReportSheet(false);
            handleCloseSheet();
          }}
        />
      </View>
    </BottomSheetModalProvider>
  );
}

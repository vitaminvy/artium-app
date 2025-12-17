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

import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import ReshareSheet from "../domains/feed/components/sheets/ReshareSheet";
import { FeedPost } from "../domains/feed/types";

// Domain Imports
import { ArtworkDetail } from "../domains/artwork/types";
// --- UPDATED IMPORTS ---
import {
  getArtworkById,
  incrementArtworkView,
  toggleArtworkLike,
} from "../domains/artwork/services/artworkService";
import SaveSheet from "../domains/artwork/components/SaveSheet";
import ReportSheet from "../domains/artwork/components/ReportSheet";
import ArtworkCarousel from "../domains/artwork/components/ArtworkCarousel";
import { shareArtwork } from "../shared/utils/shareArtwork";
import Loader from "../shared/components/Loader";

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
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // --- DATA FETCHING & VIEW COUNT LOGIC ---
  useEffect(() => {
    const artworkId = route.params?.id;
    if (!artworkId) {
      setError("No artwork ID provided.");
      setLoading(false);
      return;
    }

    const fetchArtwork = async () => {
      try {
        setLoading(true);
        const artworkData: any = await getArtworkById(artworkId);
        setArtwork(artworkData);
        // Increment view count after successfully fetching artwork
        if (artworkData) {
          await incrementArtworkView(artworkId);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching the artwork.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [route.params?.id]);


  const reshareTarget: FeedPost | null = useMemo(() => {
    if (!artwork) return null;
    return {
      id: artwork.id,
      author: {
        id: artwork.artist.name,
        name: artwork.artist.name,
        handle: artwork.artist.name.replace(/\s+/g, "").toLowerCase(),
        avatar: artwork.artist.avatar,
        verified: artwork.artist.verified,
      },
      content: `${artwork.title} · ${artwork.price}`,
      createdAt: Date.now(),
      relativeTime: "Just now",
      media: {
        url: artwork.images[0],
        aspectRatio: 3 / 3,
        placeholderColor: "#CBD5E1",
      },
      metrics: { likes: 0, comments: 0, shares: 0 },
    };
  }, [artwork]);

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
  
  // --- LIKE HANDLER ---
  const handleLike = async () => {
    if (!artwork) return;
    
    // Immediately update UI for better UX
    const newLikedState = !liked;
    setLiked(newLikedState);

    try {
      // Call the service to update Firestore
      await toggleArtworkLike(artwork.id, !newLikedState); // Pass the original state
    } catch (err) {
      // If the update fails, revert the UI and show an error
      console.error("Failed to update like status:", err);
      setLiked(!newLikedState); // Revert to original state
      Alert.alert("Error", "Could not update like status. Please try again.");
    }
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
    if (!reshareTarget) return;
    setHidden(true);
    setShowReshareSheet(true);
  }, [setHidden, reshareTarget]);

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
    if (!artwork) return;
    try {
      await shareArtwork({
        title: artwork.title,
        artistName: artwork.artist.name,
        marketing: "Khám phá tác phẩm này",
        deepLink: `https://www.artium.com/artwork/${artwork.id}`,
      });
    } catch (err) {
      Alert.alert("Share unavailable", "Không thể mở chia sẻ trên thiết bị này.");
    }
  }, [artwork]);
  
  // Conditional Rendering
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-red-500 text-center">{error}</Text>

        <Pressable onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-blue-500">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-slate-500">Artwork not found.</Text>
         <Pressable onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-blue-500">Go Back</Text>
        </Pressable>
      </View>
    );
  }

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
            <ArtworkCarousel images={artwork.images} />
          </View>

          <ArtworkInfo detail={artwork} />
          <ArtworkDetails detail={artwork} />

          {/* Similar Works section removed for now */}
        </ScrollView>

        {/* Action Bar */}
        <ArtworkActionBar
          liked={liked}
          saved={saved}
          reshared={reshared}
          actionBottom={actionBottom}
          onLike={handleLike}
          onReshare={handleOpenReshareSheet}
          onSave={handleOpenSaveSheet}
        />

        {/* Reshare Sheet */}
        {reshareTarget && (
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
        )}

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
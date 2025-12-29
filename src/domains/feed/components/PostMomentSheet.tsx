import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PostMomentEditor from "./PostMomentEditor";
import PostMomentPreview from "./PostMomentPreview";
import { PostMomentMedia } from "../types";
import { ANIMATION_CONFIG, MEDIA_CONFIG } from "../constants/media";
import { FEED_MESSAGES } from "../constants/messages";
import { useProfileContext } from "@/domains/user/contexts/ProfileContext";
import { useAuth } from "@/domains/auth/contexts/AuthContext";

type Props = {
  visible: boolean;
  text: string;
  media?: PostMomentMedia;
  canShare: boolean;
  onChangeText: (value: string) => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  onRemoveMedia: () => void;
  onRemoveImageAt: (index: number) => void;
  onVideoDuration?: (durationMs: number) => void;
  onShare: () => void;
  onClose: () => void;
  isVideoActive?: boolean;
};

export default function PostMomentSheet({
  visible,
  text,
  media,
  canShare,
  onChangeText,
  onPickImage,
  onPickVideo,
  onRemoveMedia,
  onRemoveImageAt,
  onVideoDuration,
  onShare,
  onClose,
  isVideoActive,
}: Props) {
  const insets = useSafeAreaInsets();
  const { profile } = useProfileContext();
  const { currentUser } = useAuth();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [...ANIMATION_CONFIG.MOMENT_SHEET_SNAP_POINTS], []);
  const blurOpacity = useSharedValue(0);
  const author = useMemo(() => {
    if (!currentUser) {
      return {
        name: "You",
        handle: "you",
        avatar: undefined,
      };
    }
    const name =
      profile.user.name ||
      currentUser.displayName ||
      currentUser.email ||
      "You";
    const rawHandle =
      profile.user.handle ||
      (currentUser.email ? currentUser.email.split("@")[0] : "you");
    const handle = rawHandle.startsWith("@") ? rawHandle.slice(1) : rawHandle;
    const profileAvatar =
      typeof profile.user.avatarUri === "string" && profile.user.avatarUri.length > 0
        ? profile.user.avatarUri
        : undefined;
    const authAvatar =
      typeof currentUser.photoURL === "string" && currentUser.photoURL.length > 0
        ? currentUser.photoURL
        : undefined;
    const avatar = profileAvatar ?? authAvatar;
    return { name, handle, avatar };
  }, [currentUser, profile.user.avatarUri, profile.user.handle, profile.user.name]);

  useEffect(() => {
    blurOpacity.value = withTiming(visible ? 1 : 0, {
      duration: ANIMATION_CONFIG.SHEET_ANIMATION
    });
    if (visible) {
      sheetRef.current?.present();
      sheetRef.current?.snapToIndex(1);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [blurOpacity, visible]);

  const handleSheetDismiss = useCallback(() => {
    if (visible) {
      onClose();
    }
  }, [onClose, visible]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={ANIMATION_CONFIG.BACKDROP_OPACITY_LIGHT}
      />
    ),
    []
  );

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, blurStyle]}
      >
        <BlurView intensity={ANIMATION_CONFIG.BACKDROP_BLUR_INTENSITY} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        onDismiss={handleSheetDismiss}
        index={1}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: MEDIA_CONFIG.PLACEHOLDER_COLOR_ALT }}
        backgroundStyle={{ backgroundColor: "white" }}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-semibold text-slate-900">
              {FEED_MESSAGES.MOMENT_TITLE}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              className="h-9 w-9 rounded-full bg-slate-100 items-center justify-center active:opacity-70"
            >
              <Ionicons name="close" size={22} color="#0F172A" />
            </Pressable>
          </View>

          <PostMomentEditor
            text={text}
            media={media}
            onChangeText={onChangeText}
            onPickImage={onPickImage}
            onPickVideo={onPickVideo}
            author={author}
          />

          <PostMomentPreview
            media={media}
            onRemoveImage={onRemoveImageAt}
            onClear={onRemoveMedia}
            onVideoDuration={onVideoDuration}
          />

          <Pressable
            onPress={onShare}
            disabled={!canShare}
            className={`mt-2 rounded-full py-4 items-center ${
              canShare ? "bg-[#0B73FF]" : "bg-slate-200"
            } active:opacity-90`}
          >
            <Text
              className={`text-base font-semibold ${
                canShare ? "text-white" : "text-slate-500"
              }`}
            >
              {FEED_MESSAGES.SHARE_BUTTON}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

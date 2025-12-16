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

type Props = {
  visible: boolean;
  text: string;
  media?: PostMomentMedia;
  canShare: boolean;
  onChangeText: (value: string) => void;
  onPickImage: () => void;
  onPickVideo: () => void;
  onRemoveMedia: () => void;
  onShare: () => void;
  onClose: () => void;
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
  onShare,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["46%", "86%"], []);
  const blurOpacity = useSharedValue(0);

  useEffect(() => {
    blurOpacity.value = withTiming(visible ? 1 : 0, { duration: 180 });
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
        opacity={0.08}
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
        <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>

      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        onDismiss={handleSheetDismiss}
        index={1}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
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
              Post a Moment
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
          />

          <PostMomentPreview media={media} onRemove={onRemoveMedia} />

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
              Share to feed
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

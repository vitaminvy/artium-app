import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { FeedPost } from "../../types";
import { CURRENT_USER, FEED_STRINGS } from "../../constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  target?: FeedPost;
  onClose: () => void;
  onSubmit: (text: string) => void | Promise<void>;
  isSubmitting?: boolean;
};

export default function ReshareSheet({
  visible,
  target,
  onClose,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [note, setNote] = useState("");
  const snapPoints = useMemo(() => ["90%"], []);

  // Handle sheet visibility
  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      setNote("");
    } else {
      Keyboard.dismiss();
      sheetRef.current?.dismiss();
    }
  }, [visible, target]);

  const handleSheetDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    sheetRef.current?.dismiss();
  }, []);

  const handleSubmit = useCallback(() => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(note.trim());
    setNote("");
  }, [isSubmitting, note, onSubmit]);

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

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      onDismiss={handleSheetDismiss}
      index={0}
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
          paddingBottom: Math.max(insets.bottom, 12) + 12,
          paddingHorizontal: 20,
          paddingTop: 8
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center gap-2">
            {CURRENT_USER.avatar ? (
              <View className="h-10 w-10 rounded-full overflow-hidden">
                <Animated.Image
                  source={{ uri: CURRENT_USER.avatar }}
                  className="h-full w-full"
                />
              </View>
            ) : (
              <View className="h-10 w-10 rounded-full bg-emerald-500 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {CURRENT_USER.name?.[0] || "YOU"}
                </Text>
              </View>
            )}
            <View>
              <Text className="text-sm font-semibold text-slate-900">
                {CURRENT_USER.name}
              </Text>
              <Text className="text-xs text-slate-500">
                @{CURRENT_USER.handle}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleClose}
            hitSlop={8}
            className="active:opacity-60"
          >
            <Ionicons name="close-outline" size={26} color="#0F172A" />
          </Pressable>
        </View>

        {/* Text Input */}
        <TextInput
          placeholder={FEED_STRINGS.RESHARE_TITLE}
          value={note}
          onChangeText={setNote}
          className="text-base text-slate-900 mb-4 min-h-[60px]"
          placeholderTextColor="#94A3B8"
          multiline
          maxLength={280}
          autoFocus
          keyboardAppearance={colorScheme === "dark" ? "dark" : "light"}
        />

        {/* Target Post Preview */}
        {target ? (
          <View className="border border-slate-200 rounded-2xl p-3 mb-4 bg-slate-50">
            <View className="flex-row items-center gap-2 mb-2">
              {target.author.avatar ? (
                <View className="h-8 w-8 rounded-full overflow-hidden bg-slate-200">
                  <Animated.Image
                    source={{ uri: target.author.avatar }}
                    className="h-full w-full"
                  />
                </View>
              ) : (
                <View className="h-8 w-8 rounded-full bg-slate-300 items-center justify-center">
                  <Text className="text-xs font-semibold text-slate-700">
                    {target.author.name[0]}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-900">
                  {target.author.name}
                </Text>
                <Text className="text-xs text-slate-500">
                  @{target.author.handle} · {target.relativeTime ?? "1m"}
                </Text>
              </View>
            </View>
            <Text className="text-[13px] text-slate-800 mb-2 leading-5">
              {target.content}
            </Text>
            {target.media && "url" in target.media && target.media.url ? (
              <View
                className="rounded-xl overflow-hidden"
                style={{
                  backgroundColor: target.media.placeholderColor ?? "#CBD5E1",
                  aspectRatio: target.media.aspectRatio ?? 1,
                }}
              >
                <Animated.Image
                  source={{ uri: target.media.url }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Helper Text */}
        <Text className="text-[12px] text-slate-500 mb-4">
          {FEED_STRINGS.RESHARE_NOTE}
        </Text>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-full py-4 items-center ${
            isSubmitting ? "bg-blue-400" : "bg-[#0B73FF] active:opacity-90"
          }`}
        >
          <View className="flex-row items-center gap-2">
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : null}
            <Text className="text-base font-semibold text-white">
              {isSubmitting ? "Sharing..." : FEED_STRINGS.RESHARE_BUTTON}
            </Text>
          </View>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

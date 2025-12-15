import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import {
  View,
  Pressable,
  Text,
  useColorScheme,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetFooter,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type {
  BottomSheetBackdropProps,
  BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { FeedComment, FeedPost } from "../../types";
import { CURRENT_USER, FEED_STRINGS } from "../../constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  target?: FeedPost;
  comments: FeedComment[];
  onSubmit: (text: string) => void;
  onClose: () => void;
};

type FooterExtraProps = {
  bottomInset: number;
  colorScheme: "light" | "dark" | null | undefined;
  onSubmit: (text: string) => void;
  resetKey: string;
};

function CommentsFooter({
  bottomInset,
  colorScheme,
  onSubmit,
  resetKey,
  ...props
}: BottomSheetFooterProps & FooterExtraProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    setText("");
  }, [resetKey]);

  const handleSubmit = useCallback(() => {
    const v = text.trim();
    if (!v) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(v);
    setText("");
  }, [text, onSubmit]);

  const canPost = text.trim().length > 0;

  return (
    <BottomSheetFooter {...props} bottomInset={bottomInset}>
      <View className="px-4 pt-3 bg-white border-t border-slate-100">
        <View className="flex-row items-center rounded-full border border-slate-200 px-3 py-2 bg-slate-50">
          {CURRENT_USER.avatar ? (
            <View className="h-8 w-8 rounded-full overflow-hidden mr-2">
              <Animated.Image
                source={{ uri: CURRENT_USER.avatar }}
                className="h-full w-full"
              />
            </View>
          ) : (
            <View className="h-8 w-8 rounded-full bg-emerald-500 items-center justify-center mr-2">
              <Text className="text-white text-xs font-semibold">
                {CURRENT_USER.name?.[0] || "You"}
              </Text>
            </View>
          )}

          <BottomSheetTextInput
            className="flex-1 text-base text-slate-900"
            placeholder={FEED_STRINGS.COMMENTS_PLACEHOLDER}
            placeholderTextColor="#94A3B8"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            keyboardAppearance={colorScheme === "dark" ? "dark" : "light"}
          />

          <Pressable
            onPress={handleSubmit}
            hitSlop={8}
            disabled={!canPost}
            className="active:opacity-70"
          >
            <Text
              className={`text-base font-semibold ${canPost ? "text-[#0B73FF]" : "text-slate-300"
                }`}
            >
              {FEED_STRINGS.COMMENTS_POST}
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetFooter>
  );
}

export default function CommentsSheet({
  visible,
  target,
  comments,
  onClose,
  onSubmit,
}: Props) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { height } = useWindowDimensions();
  const bottomInset = Math.max(insets.bottom, 14);
  const snapPoints = useMemo(
    () => [height * 0.4, height * 0.55],
    [height]
  );

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      sheetRef.current?.snapToIndex(0);
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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
      />
    ),
    []
  );

  const renderItem = useCallback(({ item }: { item: FeedComment }) => (
    <View className="flex-row gap-3 px-4 py-3">
      <View className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden items-center justify-center">
        {item.author.avatar ? (
          <Animated.Image
            source={{ uri: item.author.avatar }}
            className="h-full w-full"
          />
        ) : (
          <Text className="text-xs font-semibold text-slate-700">
            {item.author.name[0]}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-slate-900">
            {item.author.name}
          </Text>
          <Text className="text-[11px] text-slate-500">@{item.author.handle}</Text>
          <Text className="text-[11px] text-slate-400">· {item.relativeTime}</Text>
        </View>
        <Text className="text-sm text-slate-800 mt-1 leading-5">
          {item.content}
        </Text>
      </View>
    </View>
  ), []);

  const ListEmptyComponent = useCallback(() => (
    <View className="px-4 py-8">
      <Text className="text-sm text-slate-600 text-center">
        {FEED_STRINGS.COMMENTS_EMPTY}
      </Text>
    </View>
  ), []);

  const resetKey = `${visible ? "1" : "0"}:${target?.id ?? "none"}`;
  const footerHeight = bottomInset + 88;

  const footerComponent = useCallback(
    (props: BottomSheetFooterProps) => (
      <CommentsFooter
        {...props}
        bottomInset={bottomInset}
        colorScheme={colorScheme}
        onSubmit={onSubmit}
        resetKey={resetKey}
      />
    ),
    [bottomInset, colorScheme, onSubmit, resetKey]
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
      footerComponent={footerComponent}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View className="px-4 pb-3 flex-row items-center justify-between border-b border-slate-100">
            <Text className="text-xl font-bold text-slate-900">
              {FEED_STRINGS.COMMENTS_TITLE}
            </Text>
            <Pressable
              onPress={handleClose}
              hitSlop={8}
              className="active:opacity-60"
            >
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>

          <BottomSheetFlatList
            style={{ flex: 1 }}
            data={comments}
            keyExtractor={(item: any) => item.id}
            renderItem={renderItem}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: footerHeight,
              paddingTop: 8,
            }}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

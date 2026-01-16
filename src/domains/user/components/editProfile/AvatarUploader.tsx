import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, Modal, Animated } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  value?: string | null;
  onPick?: () => void;
  onClear?: () => void;
  onImageLoad?: () => void;
};

export default function AvatarUploader({
  value,
  onPick,
  onClear,
  onImageLoad,
}: Props) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const fallbackLogo = require("../../../../../assets/logos/logo-light-mode.png");
  const imageSource = value ? { uri: value } : fallbackLogo;
  const notifiedRef = useRef(false);
  const lastValueRef = useRef<string | null | undefined>(value);

  // Animation for press effect
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (lastValueRef.current !== value) {
      notifiedRef.current = false;
      lastValueRef.current = value;
    }
  }, [value]);

  const notifyImageLoad = useCallback(() => {
    if (!onImageLoad || notifiedRef.current) return;
    notifiedRef.current = true;
    onImageLoad();
  }, [onImageLoad]);

  useEffect(() => {
    if (!value) {
      notifyImageLoad();
    }
  }, [value, notifyImageLoad]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="mb-8">
      {/* Modern Label */}
      <Text className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
        Profile Picture
      </Text>

      <View className="items-center">
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={() => setSheetVisible(true)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            className="relative"
          >
            {/* Outer gradient ring */}
            <View
              className="rounded-full p-[3px]"
              style={{
                backgroundColor: "#f1f5f9",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {/* Avatar Container */}
              <View className="h-32 w-32 rounded-full bg-white overflow-hidden border-2 border-white">
                <Image
                  source={imageSource}
                  style={{ width: "100%", height: "100%" }}
                  contentFit={value ? "cover" : "contain"}
                  cachePolicy="memory-disk"
                  transition={200}
                  onLoadEnd={notifyImageLoad}
                  onError={notifyImageLoad}
                />
              </View>
            </View>

            {/* Camera Icon Badge - Modern floating design */}
            <View
              className="absolute -bottom-1 -right-1 h-11 w-11 rounded-full items-center justify-center"
              style={{
                backgroundColor: "#3b82f6",
                shadowColor: "#3b82f6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Ionicons name="camera" size={20} color="#ffffff" />
            </View>

            {/* Hover ring effect (static for visual appeal) */}
            {!value && (
              <View
                className="absolute inset-0 rounded-full border-2 border-dashed border-slate-300"
                style={{ margin: 3 }}
              />
            )}
          </Pressable>
        </Animated.View>

        {/* Helper text */}
        <Text className="text-sm text-slate-400 mt-4">
          Tap to change photo
        </Text>
      </View>

      {/* Modern Bottom Sheet */}
      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setSheetVisible(false)}
        />
        <View
          className="bg-white rounded-t-[28px] px-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
          {/* Handle bar */}
          <View className="items-center mb-4">
            <View className="w-10 h-1 rounded-full bg-slate-200" />
          </View>

          {/* Title */}
          <Text className="text-lg font-bold text-slate-900 mb-4 text-center">
            Profile Picture
          </Text>

          {/* Options */}
          <View className="gap-2">
            <Pressable
              onPress={() => {
                setSheetVisible(false);
                onPick?.();
              }}
              className="flex-row items-center py-4 px-4 rounded-2xl bg-blue-50 active:bg-blue-100"
            >
              <View className="h-10 w-10 rounded-full bg-blue-500 items-center justify-center">
                <Ionicons name="image-outline" size={20} color="#ffffff" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  Choose from Library
                </Text>
                <Text className="text-sm text-slate-500">
                  Select a photo from your gallery
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            {value && (
              <Pressable
                onPress={() => {
                  setSheetVisible(false);
                  onClear?.();
                }}
                className="flex-row items-center py-4 px-4 rounded-2xl bg-rose-50 active:bg-rose-100"
              >
                <View className="h-10 w-10 rounded-full bg-rose-500 items-center justify-center">
                  <Ionicons name="trash-outline" size={20} color="#ffffff" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-base font-semibold text-rose-600">
                    Remove Photo
                  </Text>
                  <Text className="text-sm text-slate-500">
                    Delete your current profile picture
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </Pressable>
            )}
          </View>

          {/* Cancel Button */}
          <Pressable
            onPress={() => setSheetVisible(false)}
            className="mt-4 py-4 rounded-2xl bg-slate-100 items-center active:bg-slate-200"
          >
            <Text className="text-base font-semibold text-slate-700">
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

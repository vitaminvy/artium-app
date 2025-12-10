import React from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { UPLOAD_OPTIONS } from "./tabTypes";

interface UploadActionSheetProps {
  visible: boolean;
  onClose: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function UploadActionSheet({ visible, onClose }: UploadActionSheetProps) {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop (Dark Overlay) */}
        <AnimatedPressable
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="absolute inset-0 bg-black/40"
          onPress={onClose}
        />

        {/* Bottom Sheet Content */}
        <Animated.View
          entering={SlideInDown.springify().damping(18).mass(0.9).stiffness(200)}
          exiting={SlideOutDown.duration(200)}
          className="w-full px-5 pb-8 pt-3"
        >

          {/* Handle Bar Indicator */}
          <View className="items-center mb-3">
            {/* Invisible spacer or actual handle if needed, but the design used a spacer */}
            {/* To keep it consistent with previous design, we can render a handle on top of the sheet or separate */}
          </View>

          <View className="rounded-[24px] bg-white shadow-2xl overflow-hidden">
            {/* Header Handle inside the white box looks cleaner usually, or floating above. */}

            {UPLOAD_OPTIONS.map((opt, idx) => (
              <Pressable
                key={opt.title}
                className={`flex-row items-center gap-4 px-5 py-5 active:bg-slate-50 ${idx < UPLOAD_OPTIONS.length - 1 ? "border-b border-slate-100" : ""
                  }`}
                onPress={() => {
                  Haptics.selectionAsync(); // Light feedback on selection
                  onClose();
                  // TODO: Navigate or perform action here
                }}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: opt.tint }}
                >
                  <Ionicons name={opt.icon} size={24} color={opt.iconColor} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-[17px] font-semibold text-slate-900">
                    {opt.title}
                  </Text>
                  <Text className="text-[13px] text-slate-500 leading-4">
                    {opt.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
              </Pressable>
            ))}
          </View>

          {/* Cancel Button (Optional, improves UX) */}
          <Pressable
            onPress={onClose}
            className="mt-4 bg-white rounded-full py-4 items-center shadow-sm active:opacity-90"
          >
            <Text className="font-bold text-slate-900 text-base">Cancel</Text>
          </Pressable>

        </Animated.View>
      </View>
    </Modal>
  );
}

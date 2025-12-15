import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { UPLOAD_OPTIONS } from "./tabTypes";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UploadActionSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function UploadActionSheet({ visible, onClose }: UploadActionSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["45%", "60%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

  const handleSheetDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

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
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 20,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 14),
        }}
      >
        <View className="rounded-[24px] bg-white shadow-2xl overflow-hidden">
          {UPLOAD_OPTIONS.map((opt, idx) => (
            <Pressable
              key={opt.title}
              className={`flex-row items-center gap-4 px-5 py-5 active:bg-slate-50 ${
                idx < UPLOAD_OPTIONS.length - 1 ? "border-b border-slate-100" : ""
              }`}
              onPress={() => {
                Haptics.selectionAsync();
                onClose();
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
      </BottomSheetView>
    </BottomSheetModal>
  );
}

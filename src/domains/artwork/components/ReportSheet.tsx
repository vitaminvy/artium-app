import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ReportSheetProps = {
  visible: boolean;
  onClose: () => void;
  onReport: (reasons: string[], message?: string) => void;
};

const REASONS = [
  "It's spam",
  "Nudity or sexual activity",
  "Hate speech or symbols",
  "False information",
  "Bullying or harassment",
  "Scam or fraud",
  "Violence or dangerous organization",
  "Other",
] as const;

export default function ReportSheet({ visible, onClose, onReport }: ReportSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const snapPoints = useMemo(() => ["85%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      setSelectedReasons([]);
      setMessage("");
    }
  }, [visible]);

  const backdrop = useCallback(
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

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) => {
      if (prev.includes(reason)) {
        return prev.filter((r) => r !== reason);
      }
      return [...prev, reason];
    });
  };

  const handleSubmit = () => {
    if (selectedReasons.length === 0) return;
    onReport(selectedReasons, message.trim() || undefined);
    sheetRef.current?.dismiss();
    onClose();
  };

  const isReasonSelected = (reason: string) => selectedReasons.includes(reason);

  const renderFooter = useCallback(
    (props: any) => (
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 12) + 12,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#E2E8F0",
        }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={selectedReasons.length === 0}
          className="rounded-full py-4 items-center"
          style={{
            backgroundColor: selectedReasons.length > 0 ? "#A3E635" : "#E2E8F0",
          }}
        >
          <Text
            className="text-base font-semibold"
            style={{
              color: selectedReasons.length > 0 ? "#0F172A" : "#94A3B8",
            }}
          >
            Submit Report
            {selectedReasons.length > 0 && ` (${selectedReasons.length})`}
          </Text>
        </Pressable>
      </View>
    ),
    [selectedReasons, handleSubmit, insets.bottom]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      backdropComponent={backdrop}
      onDismiss={onClose}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
      backgroundStyle={{ backgroundColor: "white" }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      footerComponent={renderFooter}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-slate-900">Report Content</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close-outline" size={26} color="#0F172A" />
          </Pressable>
        </View>

        <View className="mb-6">
          <Text className="text-base font-semibold text-slate-900 mb-3">
            Why are you reporting this content?
          </Text>
          <Text className="text-sm text-slate-500 mb-4">
            Select all that apply
          </Text>
          <View className="gap-3">
            {REASONS.map((item) => {
              const selected = isReasonSelected(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggleReason(item)}
                  className="flex-row items-center gap-3 py-1"
                >
                  <View
                    className="h-6 w-6 rounded items-center justify-center border-2"
                    style={{
                      borderColor: selected ? "#0B73FF" : "#CBD5E1",
                      backgroundColor: selected ? "#0B73FF" : "transparent",
                    }}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text
                    className="text-base flex-1"
                    style={{ color: selected ? "#0F172A" : "#64748B" }}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="gap-2 mb-4">
          <Text className="text-base font-semibold text-slate-900">
            Add a message (optional)
          </Text>
          <View className="rounded-2xl border border-slate-200 px-4 py-3 bg-white min-h-[120px]">
            <BottomSheetTextInput
              multiline
              placeholder="Provide additional details..."
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={setMessage}
              style={{
                fontSize: 16,
                color: "#0F172A",
                minHeight: 80,
                textAlignVertical: "top",
              }}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

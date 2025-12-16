import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ReportSheetProps = {
  visible: boolean;
  onClose: () => void;
  onReport: (reason: string, message?: string) => void;
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
  const [reason, setReason] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const snapPoints = useMemo(() => ["78%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
      setReason(null);
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

  const handleSubmit = () => {
    if (!reason) return;
    onReport(reason, message.trim() || undefined);
    sheetRef.current?.dismiss();
    onClose();
  };

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
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 12) + 80,
          gap: 16,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-slate-900">Report Content</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close-outline" size={26} color="#0F172A" />
          </Pressable>
        </View>
        <View>
          <Text className="text-base font-semibold text-slate-900 mb-3">
            Why are you reporting this content?
          </Text>
          <View className="gap-3">
            {REASONS.map((item) => (
              <Pressable
                key={item}
                onPress={() => setReason(item)}
                className="flex-row items-center gap-3"
              >
                <Ionicons
                  name={reason === item ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color={reason === item ? "#0B73FF" : "#94A3B8"}
                />
                <Text className="text-base text-slate-900">{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-base font-semibold text-slate-900">Add a message</Text>
          <View className="rounded-2xl border border-slate-200 px-4 py-3 bg-white min-h-[120px]">
            <TextInput
              multiline
              placeholder="Add an optional message for the team"
              placeholderTextColor="#94A3B8"
              value={message}
              onChangeText={setMessage}
              className="text-base text-slate-900"
              style={{ minHeight: 80 }}
            />
          </View>
        </View>
      </BottomSheetScrollView>

      <View
        style={{
          position: "absolute",
          bottom: Math.max(insets.bottom, 12) + 12,
          left: 20,
          right: 20,
        }}
      >
        <Pressable
          onPress={handleSubmit}
          disabled={!reason}
          className="rounded-full py-4 items-center"
          style={{ backgroundColor: reason ? "#A3E635" : "#E2E8F0" }}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: reason ? "#0F172A" : "#94A3B8" }}
          >
            Submit
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}

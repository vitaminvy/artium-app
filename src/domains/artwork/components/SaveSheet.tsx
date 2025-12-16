import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, Image, Keyboard } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetFooter, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type Moodboard = {
  id: string;
  name: string;
  count: number;
  cover: string;
  isPrivate?: boolean;
};

type SaveSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (moodboardId: string | null) => void;
  initialSelectedId?: string | null;
};

export default function SaveSheet({
  visible,
  onClose,
  onSelect,
  initialSelectedId,
}: SaveSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const createRef = useRef<BottomSheetModal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);
  const [moodboards, setMoodboards] = useState<Moodboard[]>([
    {
      id: "mb-1",
      name: "Private Moodboard",
      count: 2,
      cover: "https://images.unsplash.com/photo-1523419400524-fc1e1cc2d6c5?auto=format&fit=crop&w=300&q=80",
      isPrivate: true,
    },
    {
      id: "mb-2",
      name: "Favorites",
      count: 5,
      cover: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=300&q=80",
    },
  ]);
  const [newBoardName, setNewBoardName] = useState("");
  const snapPoints = useMemo(() => ["75%"], []);
  const createSnap = useMemo(() => ["45%"], []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      setSelectedId(initialSelectedId ?? null);
    } else {
      Keyboard.dismiss();
      sheetRef.current?.dismiss();
      createRef.current?.dismiss();
      setNewBoardName("");
    }
  }, [visible, initialSelectedId]);

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

  const handleCloseAll = () => {
    Keyboard.dismiss();
    sheetRef.current?.dismiss();
    createRef.current?.dismiss();
    onClose();
  };

  const handleCreate = () => {
    if (!newBoardName.trim()) return;
    const id = `mb-${Date.now()}`;
    const next: Moodboard = {
      id,
      name: newBoardName.trim(),
      count: 0,
      cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80",
    };
    setMoodboards((prev) => [next, ...prev]);
    setSelectedId(id);
    setNewBoardName("");
    createRef.current?.dismiss();
  };

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleDone = useCallback(() => {
    onSelect(selectedId);
    handleCloseAll();
  }, [selectedId, onSelect]);

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={Math.max(insets.bottom, 16)}>
        <View className="px-5 bg-white pt-2 pb-1">
          <Pressable
            onPress={handleDone}
            className="rounded-full bg-[#0B73FF] py-4 items-center active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">Done</Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [handleDone, insets.bottom]
  );

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        backdropComponent={backdrop}
        footerComponent={renderFooter}
        onDismiss={onClose}
        handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
        backgroundStyle={{ backgroundColor: "white" }}
        enablePanDownToClose
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 6,
            paddingBottom: Math.max(insets.bottom, 16) + 80,
            gap: 16,
          }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-slate-900">Add to</Text>
            <Pressable onPress={handleCloseAll} hitSlop={8}>
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>

          {moodboards.map((mb) => (
            <Pressable
              key={mb.id}
              onPress={() => handleSelect(mb.id)}
              className="rounded-3xl border border-slate-200 px-4 py-4 flex-row items-center"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <View className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-200 mr-3">
                <Image
                  source={{ uri: mb.cover }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg font-semibold text-slate-900">
                    {mb.name}
                  </Text>
                  {mb.isPrivate ? (
                    <Ionicons name="lock-closed-outline" size={16} color="#0F172A" />
                  ) : null}
                </View>
                <Text className="text-sm text-slate-500">
                  {mb.count} saved artworks
                </Text>
              </View>
              <Ionicons
                name={selectedId === mb.id ? "checkbox" : "square-outline"}
                size={24}
                color={selectedId === mb.id ? "#0B73FF" : "#CBD5E1"}
              />
            </Pressable>
          ))}

          <Pressable
            onPress={() => createRef.current?.present()}
            className="flex-row items-center justify-center gap-2 py-3"
          >
            <Ionicons name="add" size={22} color="#0B73FF" />
            <Text className="text-base font-semibold text-[#0B73FF]">
              Create new moodboard
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={createRef}
        snapPoints={createSnap}
        index={0}
        backdropComponent={backdrop}
        enablePanDownToClose
        onDismiss={() => {
          Keyboard.dismiss();
          setNewBoardName("");
        }}
        handleIndicatorStyle={{ backgroundColor: "#CBD5E1" }}
        backgroundStyle={{ backgroundColor: "white" }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: Math.max(insets.bottom, 12) + 16,
            paddingTop: 8,
            gap: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">
              Create a New Moodboard
            </Text>
            <Pressable onPress={() => createRef.current?.dismiss()} hitSlop={8}>
              <Ionicons name="close-outline" size={24} color="#0F172A" />
            </Pressable>
          </View>

          <View className="gap-2">
            <Text className="text-xs font-semibold text-slate-500">
              MOODBOARD NAME
            </Text>
            <View className="rounded-2xl border border-slate-200 px-4 py-3 bg-white">
              <BottomSheetTextInput
                value={newBoardName}
                onChangeText={setNewBoardName}
                placeholder="Enter moodboard name"
                placeholderTextColor="#94A3B8"
                style={{
                  fontSize: 16,
                  color: "#0F172A",
                  padding: 0,
                }}
                maxLength={24}
              />
              <Text className="text-xs text-slate-400 text-right mt-1">
                {newBoardName.length}/24 characters
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-2">
            <Ionicons name="information-circle-outline" size={16} color="#0B73FF" />
            <Text className="flex-1 text-sm text-slate-600">
              This Moodboard will be shown on your public profile
            </Text>
          </View>

          <View className="flex-row items-center gap-3 mt-4">
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                createRef.current?.dismiss();
              }}
              className="flex-1 rounded-full border border-slate-200 py-3 items-center active:opacity-80"
            >
              <Text className="text-base font-semibold text-slate-900">Back</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                handleCreate();
              }}
              disabled={!newBoardName.trim()}
              className="flex-1 rounded-full py-3 items-center"
              style={{
                backgroundColor: newBoardName.trim() ? "#0B73FF" : "#E2E8F0",
              }}
            >
              <Text
                className="text-base font-semibold"
                style={{ color: newBoardName.trim() ? "#fff" : "#94A3B8" }}
              >
                Create & Save
              </Text>
            </Pressable>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </>
  );
}

import React from "react";
import { View, Text, Pressable, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  value?: string | null;
  onPick?: () => void;
  onClear?: () => void;
};

export default function AvatarUploader({ value, onPick, onClear }: Props) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = React.useState(false);
  const fallbackLogo = require("../../../../../assets/logos/logo-light-mode.png");
  const imageSource = value ? { uri: value } : fallbackLogo;

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-slate-500 mb-3">
        PROFILE PICTURE <Text className="text-red-500">*</Text>
      </Text>

      <View className="items-center">
        <Pressable
          onPress={() => setSheetVisible(true)}
          className="h-28 w-28 rounded-full bg-slate-100 border border-slate-200 items-center justify-center overflow-hidden"
          style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8 }}
        >
          <Image
            source={imageSource}
            style={{ width: "100%", height: "100%" }}
            resizeMode={value ? "cover" : "contain"}
          />
          <View className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white items-center justify-center shadow-sm">
            <Ionicons name="pencil" size={16} color="#0F172A" />
          </View>
        </Pressable>
      </View>

      <Modal
        visible={sheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSheetVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setSheetVisible(false)}
        />
        <View
          className="bg-white rounded-t-3xl px-6 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Pressable
            onPress={() => {
              setSheetVisible(false);
              onPick?.();
            }}
            className="flex-row items-center py-4"
          >
            <Ionicons name="arrow-up-outline" size={20} color="#0F172A" />
            <Text className="ml-3 text-base font-semibold text-slate-900">
              New Profile Picture
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setSheetVisible(false);
              onClear?.();
            }}
            className="flex-row items-center py-4"
          >
            <Ionicons name="close" size={20} color="#0F172A" />
            <Text className="ml-3 text-base font-semibold text-slate-900">
              Remove Profile Picture
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

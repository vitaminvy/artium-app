import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { EDIT_PROFILE_LABELS } from "../../constants/editProfile";

type Props = {
  onBack?: () => void;
  onSave?: () => void;
  saveDisabled?: boolean;
};

export default function EditProfileHeader({
  onBack,
  onSave,
  saveDisabled,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white border-b border-slate-200 px-4 pb-3"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="relative flex-row items-center justify-between">
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>

        <View className="absolute left-0 right-0 items-center pointer-events-none">
          <Text className="text-lg font-semibold text-slate-900">
            {EDIT_PROFILE_LABELS.headerTitle}
          </Text>
        </View>

        <Pressable
          onPress={onSave}
          hitSlop={8}
          disabled={saveDisabled}
          className={`px-4 py-2 rounded-full ${
            saveDisabled ? "bg-slate-200" : "bg-blue-500"
          }`}
        >
          <Text
            className={`text-sm font-semibold ${
              saveDisabled ? "text-slate-500" : "text-white"
            }`}
          >
            {EDIT_PROFILE_LABELS.save}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

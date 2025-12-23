import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

type BottomSheetInputRef = React.ComponentPropsWithRef<
  typeof BottomSheetTextInput
>["ref"];

type SheetSelectFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  inputRef?: BottomSheetInputRef;
  returnKeyType?: "next" | "done";
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  error?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onChangeText: (value: string) => void;
};

export function SheetSelectField({
  label,
  value,
  placeholder,
  required,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  error,
  loading,
  disabled,
  onPress,
  onChangeText,
}: SheetSelectFieldProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-1">
        <Text className="text-[12px] font-semibold text-slate-600 uppercase">
          {label}
        </Text>
        {required ? (
          <Text className="text-[12px] font-semibold text-red-500">*</Text>
        ) : null}
      </View>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`rounded-2xl border px-4 py-3 flex-row items-center ${
          disabled
            ? "border-slate-200 bg-slate-100"
            : "border-slate-200 bg-white"
        }`}
      >
        <View pointerEvents="none" className="flex-1">
          <BottomSheetTextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            editable={false}
            returnKeyType={returnKeyType}
            blurOnSubmit={blurOnSubmit}
            onSubmitEditing={onSubmitEditing}
            style={{
              fontSize: 15,
              color: disabled ? "#94A3B8" : "#0F172A",
              padding: 0,
            }}
          />
        </View>
        {loading ? (
          <ActivityIndicator size="small" color="#94A3B8" />
        ) : (
          <Ionicons name="chevron-down" size={18} color="#94A3B8" />
        )}
      </Pressable>
      {error ? (
        <Text className="text-[11px] text-rose-500">{error}</Text>
      ) : null}
    </View>
  );
}

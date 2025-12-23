import React from "react";
import { View, Text } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type BottomSheetInputRef = React.ComponentPropsWithRef<
  typeof BottomSheetTextInput
>["ref"];

type SheetFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  helper?: string;
  inputRef?: BottomSheetInputRef;
  returnKeyType?: "next" | "done";
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  error?: string;
  onChangeText: (value: string) => void;
};

export function SheetField({
  label,
  value,
  placeholder,
  required,
  keyboardType,
  helper,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  error,
  onChangeText,
}: SheetFieldProps) {
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
      <View className="rounded-2xl border border-slate-200 px-4 py-3 bg-white">
        <BottomSheetTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          style={{ fontSize: 15, color: "#0F172A", padding: 0 }}
        />
      </View>
      {error ? (
        <Text className="text-[11px] text-rose-500">{error}</Text>
      ) : null}
      {helper ? (
        <Text className="text-[11px] text-slate-400">{helper}</Text>
      ) : null}
    </View>
  );
}

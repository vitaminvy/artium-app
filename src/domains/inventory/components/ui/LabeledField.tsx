import React from "react";
import { Text, TextInput, View } from "react-native";

type LabeledFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  helper?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  onChangeText: (value: string) => void;
  inputRef?: (node: TextInput | null) => void;
};

export function LabeledField({
  label,
  value,
  placeholder,
  helper,
  keyboardType,
  multiline,
  onChangeText,
  inputRef,
}: LabeledFieldProps) {
  return (
    <View className="gap-3">
      <Text className="text-[12px] font-semibold text-slate-600 uppercase">
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        multiline={multiline}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] text-slate-900"
        style={
          multiline ? { minHeight: 112, textAlignVertical: "top" } : undefined
        }
      />
      {helper ? (
        <Text className="text-[11px] text-slate-400">{helper}</Text>
      ) : null}
    </View>
  );
}

import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type LabeledFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  helper?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  textContentType?: TextInputProps["textContentType"];
  multiline?: boolean;
  editable?: boolean;
  onChangeText: (value: string) => void;
  inputRef?: React.Ref<TextInput>;
  returnKeyType?: TextInputProps["returnKeyType"];
  blurOnSubmit?: TextInputProps["blurOnSubmit"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
};

export function LabeledField({
  label,
  value,
  placeholder,
  helper,
  keyboardType,
  autoCapitalize,
  textContentType,
  multiline,
  editable = true,
  onChangeText,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
}: LabeledFieldProps) {
  const inputStyles = `rounded-2xl border border-slate-200 px-4 py-4 text-[15px] ${
    editable ? "bg-white text-slate-900" : "bg-slate-100 text-slate-400"
  }`;

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
        autoCapitalize={autoCapitalize}
        textContentType={textContentType}
        multiline={multiline}
        returnKeyType={returnKeyType}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
        className={inputStyles}
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

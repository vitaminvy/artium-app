import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

type Props = {
  label: string;
  required?: boolean;
  inputRef?: React.Ref<TextInput>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  editable?: boolean;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  keyboardType?: TextInputProps["keyboardType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  returnKeyLabel?: string;
  blurOnSubmit?: boolean;
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
};

export default function AuthTextField({
  label,
  required,
  inputRef,
  value,
  onChangeText,
  placeholder,
  editable,
  autoCapitalize,
  keyboardType,
  returnKeyType,
  returnKeyLabel,
  blurOnSubmit,
  onSubmitEditing,
}: Props) {
  return (
    <View>
      <Text className="text-xs font-semibold text-gray-600 mb-2">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <TextInput
        ref={inputRef}
        className="h-[52px] rounded-[18px] border border-gray-200 px-4 text-gray-900 bg-[#fafafb]"
        style={{ paddingVertical: 0, textAlignVertical: "center" }}
        placeholder={placeholder}
        placeholderTextColor="#B8BEC8"
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        returnKeyLabel={returnKeyLabel}
        blurOnSubmit={blurOnSubmit}
        onSubmitEditing={onSubmitEditing}
        onChangeText={onChangeText}
        value={value}
        editable={editable}
      />
    </View>
  );
}

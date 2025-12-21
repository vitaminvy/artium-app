import React from "react";
import {
  Pressable,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  required?: boolean;
  inputRef?: React.Ref<TextInput>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  editable?: boolean;
  returnKeyType?: TextInputProps["returnKeyType"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  showPassword: boolean;
  onTogglePassword: () => void;
};

export default function AuthPasswordField({
  label,
  required,
  inputRef,
  value,
  onChangeText,
  placeholder,
  editable,
  returnKeyType,
  onSubmitEditing,
  showPassword,
  onTogglePassword,
}: Props) {
  return (
    <View>
      <Text className="text-xs font-semibold text-gray-600 mb-2">
        {label}
        {required ? <Text className="text-red-500"> *</Text> : null}
      </Text>
      <View className="h-[52px] rounded-[18px] border border-gray-200 px-4 flex-row items-center bg-[#fafafb]">
        <TextInput
          ref={inputRef}
          className="flex-1 text-gray-900"
          style={{ paddingVertical: 0, textAlignVertical: "center" }}
          placeholder={placeholder}
          placeholderTextColor="#B8BEC8"
          secureTextEntry={!showPassword}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onChangeText={onChangeText}
          value={value}
          editable={editable}
        />
        <Pressable onPress={onTogglePassword}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#9CA3AF"
          />
        </Pressable>
      </View>
    </View>
  );
}

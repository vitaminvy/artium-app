import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
};

export default function SearchInput({ value, onChangeText, placeholder }: Props) {
  return (
    <View className="flex-row items-center rounded-full border border-slate-200 bg-white px-4 py-3">
      <Ionicons name="search-outline" size={16} color="#0F172A" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="ml-2 flex-1 text-[13px] text-slate-900"
        returnKeyType="search"
      />
    </View>
  );
}

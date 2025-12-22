import React, { useMemo, useState, useEffect } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  FlatList,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CountryOption } from "../../constants/editProfile";

export const flagEmoji = (countryCode: string) => {
  if (!countryCode) return "🏳️";
  const codePoints = countryCode
    .trim()
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

type PickerProps = {
  visible: boolean;
  options: CountryOption[];
  selectedCode: string;
  onClose: () => void;
  onSelect: (code: string) => void;
  anchor: { y: number; height: number };
};

export default function CountryPickerModal({
  visible,
  options,
  selectedCode,
  onClose,
  onSelect,
  anchor,
}: PickerProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const topCandidate = anchor.y + anchor.height - 8;
  const bottomInset = Math.max(insets.bottom, 16);
  const maxTop = height - bottomInset - 360;
  const top = Math.min(Math.max(topCandidate, 120), maxTop);
  const maxHeight = Math.min(height - top - bottomInset, height * 0.62);

  useEffect(() => {
    if (!visible) {
      setQuery("");
    }
  }, [visible]);

  const filteredOptions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((item) => {
      const name = item.name.toLowerCase();
      const code = item.code.toLowerCase();
      const dial = item.dialCode.replace("+", "");
      return (
        name.includes(keyword) ||
        code.includes(keyword) ||
        dial.includes(keyword.replace("+", ""))
      );
    });
  }, [options, query]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.2)" }}
      />
      <View
        className="absolute left-4 right-4 rounded-2xl bg-white p-4 shadow-lg"
        style={{
          top,
          maxHeight,
        }}
      >
        <View className="mb-3">
          <Text className="text-base font-semibold text-slate-900 mb-2">
            Select country
          </Text>
          <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Ionicons name="search" size={16} color="#94A3B8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country"
              placeholderTextColor="#94A3B8"
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              className="ml-2 flex-1 text-[14px] text-slate-900"
              style={{ paddingVertical: 0 }}
            />
          </View>
        </View>
        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.code)}
              className="flex-row items-center justify-between py-3"
            >
              <View className="flex-row items-center" style={{ columnGap: 10 }}>
                <View className="h-8 w-10 rounded-lg border border-slate-200 items-center justify-center bg-slate-50">
                  <Text className="text-lg">{flagEmoji(item.code)}</Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-slate-900">
                    {item.name}
                  </Text>
                  <Text className="text-[12px] text-slate-500">
                    {item.dialCode}
                  </Text>
                </View>
              </View>
              {selectedCode === item.code ? (
                <Ionicons name="checkmark" size={18} color="#0F172A" />
              ) : null}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View className="h-px bg-slate-100" />}
        />
      </View>
    </Modal>
  );
}

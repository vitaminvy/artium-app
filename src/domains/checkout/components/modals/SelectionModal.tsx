import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  visible: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (text: string) => void;
  options: string[];
  onSelect: (value: string) => void;
  loading: boolean;
  error?: string;
  maxHeight: number;
};

export function SelectionModal({
  visible,
  onClose,
  query,
  onQueryChange,
  options,
  onSelect,
  loading,
  error,
  maxHeight,
}: Props) {
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((item) =>
      item.toLowerCase().includes(normalizedQuery)
    );
  }, [options, query]);

  const listMaxHeight = Math.max(maxHeight - 76, 200);
  const cardShadow: ViewStyle = {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 6,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View
          className="rounded-3xl bg-white px-4 py-4"
          style={[
            cardShadow,
            {
              width: "100%",
              maxWidth: 360,
              maxHeight,
              alignSelf: "center",
            },
          ]}
        >
          <View className="flex-row items-center gap-3 border-b border-slate-200 pb-2">
            <TextInput
              value={query}
              onChangeText={onQueryChange}
              placeholder="Search here..."
              placeholderTextColor="#94A3B8"
              className="flex-1 text-base text-slate-900"
            />
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-outline" size={22} color="#0F172A" />
            </Pressable>
          </View>

          <ScrollView
            className="mt-3"
            style={{ maxHeight: listMaxHeight }}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View className="py-6 items-center">
                <ActivityIndicator color="#0B73FF" />
                <Text className="text-sm text-slate-500 mt-2">Loading...</Text>
              </View>
            ) : error ? (
              <View className="py-6 items-center">
                <Text className="text-sm text-rose-500 text-center">
                  {error}
                </Text>
              </View>
            ) : filteredOptions.length === 0 ? (
              <View className="py-6 items-center">
                <Text className="text-sm text-slate-500">No results found</Text>
              </View>
            ) : (
              filteredOptions.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => onSelect(item)}
                  className="py-4 border-b border-slate-100"
                >
                  <Text className="text-base text-slate-900">{item}</Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

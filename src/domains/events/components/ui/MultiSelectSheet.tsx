import React, { useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OptionBase = {
  id: string;
  label: string;
};

type Props<T extends OptionBase> = {
  value: T[];
  options: T[];
  onChange: (next: T[]) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  offset?: number;
};

export default function MultiSelectSheet<T extends OptionBase>({
  value,
  options,
  onChange,
  placeholder = "Select",
  searchable = true,
  searchPlaceholder = "Search...",
  offset,
}: Props<T>) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [anchor, setAnchor] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = useRef<View>(null);

  const displayLabel = useMemo(() => {
    if (value.length === 0) return placeholder;
    if (value.length <= 3) return value.map((v) => v.label).join(", ");
    const firstTwo = value.slice(0, 2).map((v) => v.label).join(", ");
    return `${firstTwo} +${value.length - 2}`;
  }, [value, placeholder]);

  const bottomInset = Math.max(insets.bottom, 16);
  const dropdownOffset = offset ?? 12;
  const topCandidate = anchor.y + anchor.height + dropdownOffset;
  const availableBelow = height - topCandidate - bottomInset;
  const dropdownTop = topCandidate;
  const maxHeight = Math.max(Math.min(availableBelow, 260), 120);

  const filteredOptions = useMemo(() => {
    if (!searchable) return options;
    const keyword = query.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(keyword)
    );
  }, [options, query, searchable]);

  const toggleOption = (option: T) => {
    const exists = value.some((item) => item.id === option.id);
    if (exists) {
      onChange(value.filter((item) => item.id !== option.id));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <View>
      <Pressable
        ref={triggerRef}
        onPress={() => {
          if (triggerRef.current) {
            triggerRef.current.measureInWindow((x, y, w, h) => {
              setAnchor({ x, y, width: w, height: h });
              setOpen(true);
            });
          } else {
            setOpen(true);
          }
        }}
        className="flex-row items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-3"
      >
        <Text className="text-[13px] font-semibold text-slate-800">
          {displayLabel}
        </Text>
        <Ionicons
          name={open ? "chevron-up-outline" : "chevron-down-outline"}
          size={16}
          color="#0F172A"
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpen(false);
          setQuery("");
        }}
      >
        <View className="flex-1">
          <Pressable
            className="absolute inset-0"
            onPress={() => {
              setOpen(false);
              setQuery("");
            }}
          />
          <View
            className="absolute rounded-2xl border border-slate-200 bg-white shadow-lg"
            style={{
              left: Math.min(Math.max(anchor.x, 16), width - anchor.width - 16),
              top: dropdownTop,
              width: Math.min(anchor.width, width - 32),
              maxHeight,
            }}
          >
            {searchable ? (
              <View className="px-4 pt-4 pb-2">
                <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Ionicons name="search" size={16} color="#94A3B8" />
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    placeholder={searchPlaceholder}
                    placeholderTextColor="#94A3B8"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                    className="ml-2 flex-1 text-[13px] text-slate-900"
                    style={{ paddingVertical: 0 }}
                  />
                </View>
              </View>
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {filteredOptions.map((option, index) => {
                const isActive = value.some((item) => item.id === option.id);
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => toggleOption(option)}
                    className="flex-row items-center justify-between px-4 py-3"
                    style={{
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <Ionicons
                        name={isActive ? "checkbox" : "square-outline"}
                        size={18}
                        color={isActive ? "#0B73FF" : "#94A3B8"}
                      />
                      <Text
                        className="text-[13px] font-semibold"
                        style={{ color: isActive ? "#0B73FF" : "#0F172A" }}
                      >
                        {option.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

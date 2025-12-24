import React, { useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OptionBase = {
  id: string;
  label: string;
};

type Props<T extends OptionBase> = {
  value: T;
  options: T[];
  onChange: (option: T) => void;
  variant?: "field" | "pill";
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  showCheckbox?: boolean;
  offset?: number;
};

export default function SelectSheet<T extends OptionBase>({
  value,
  options,
  onChange,
  variant = "field",
  placeholder,
  searchable = false,
  searchPlaceholder = "Search...",
  showCheckbox = false,
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
    if (placeholder && value.id === "all") return placeholder;
    return value.label;
  }, [placeholder, value.id, value.label]);

  const bottomInset = Math.max(insets.bottom, 16);
  const dropdownOffset = offset ?? 26;
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

  return (
    <View>
      {variant === "pill" ? (
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
          className="flex-row items-center gap-2 rounded-full border px-4 py-2"
          style={{
            borderColor: value.id !== "all" ? "#0B73FF" : "#E2E8F0",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Text
            className="text-[12px] font-semibold"
            style={{ color: value.id !== "all" ? "#0B73FF" : "#0F172A" }}
          >
            {displayLabel}
          </Text>
          <Ionicons
            name={open ? "chevron-up-outline" : "chevron-down-outline"}
            size={14}
            color={value.id !== "all" ? "#0B73FF" : "#0F172A"}
          />
        </Pressable>
      ) : (
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
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpen(false);
          setQuery("");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
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
              left: Math.min(
                Math.max(anchor.x, 16),
                width - anchor.width - 16
              ),
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
              keyboardShouldPersistTaps="handled"
            >
              {(searchable ? filteredOptions : options).map((option, index) => {
                const isActive = option.id === value.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      onChange(option);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex-row items-center justify-between px-4 py-3"
                    style={{
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderColor: "#E2E8F0",
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      {showCheckbox ? (
                        <View
                          className="h-4 w-4 rounded border items-center justify-center"
                          style={{
                            borderColor: isActive ? "#0B73FF" : "#CBD5E1",
                            backgroundColor: isActive ? "#0B73FF" : "#FFFFFF",
                          }}
                        >
                          {isActive ? (
                            <Ionicons name="checkmark" size={12} color="#fff" />
                          ) : null}
                        </View>
                      ) : null}
                      <Text
                        className="text-[13px] font-semibold"
                        style={{ color: isActive ? "#0B73FF" : "#0F172A" }}
                      >
                        {option.label}
                      </Text>
                    </View>
                    {!showCheckbox && isActive ? (
                      <Ionicons name="checkmark" size={18} color="#0B73FF" />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

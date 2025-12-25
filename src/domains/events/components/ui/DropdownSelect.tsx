import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventSortOption } from "../../types";

type Props = {
  value: EventSortOption;
  options: EventSortOption[];
  onChange: (option: EventSortOption) => void;
};

export default function DropdownSelect({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="flex-row items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-3"
      >
        <Text className="text-[13px] font-semibold text-slate-800">
          {value.label}
        </Text>
        <Ionicons
          name={open ? "chevron-up-outline" : "chevron-down-outline"}
          size={16}
          color="#0F172A"
        />
      </Pressable>

      {open ? (
        <View className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {options.map((option, index) => {
            const isActive = option.id === value.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className="px-4 py-3 flex-row items-center justify-between"
                style={{
                  backgroundColor: isActive ? "#F8FAFC" : "#FFFFFF",
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderColor: "#E2E8F0",
                }}
              >
                <Text
                  className="text-[13px] font-semibold"
                  style={{ color: isActive ? "#0B73FF" : "#0F172A" }}
                >
                  {option.label}
                </Text>
                {isActive ? (
                  <Ionicons name="checkmark" size={16} color="#0B73FF" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

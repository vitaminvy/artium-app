import React, { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventGuest } from "../../types";

type Props = {
  guests: EventGuest[];
};

const GUEST_TABS: { id: EventGuest["status"]; label: string }[] = [
  { id: "going", label: "Going" },
  { id: "maybe", label: "Maybe" },
  { id: "invited", label: "Invited" },
];

const PAGE_SIZE = 5;

export default function GuestList({ guests }: Props) {
  const [activeTab, setActiveTab] = useState<EventGuest["status"]>("going");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const base = guests.filter((g) => g.status === activeTab);
    const keyword = query.trim().toLowerCase();
    if (!keyword) return base;
    return base.filter((g) => g.name.toLowerCase().includes(keyword));
  }, [guests, activeTab, query]);

  const visibleItems = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5 gap-3">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-[15px] font-semibold text-slate-900">Guests</Text>
      </View>

      <View className="flex-row items-center gap-2">
        {GUEST_TABS.map((tab) => {
          const active = tab.id === activeTab;
          const count = guests.filter((g) => g.status === tab.id).length;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                setActiveTab(tab.id);
                setVisible(PAGE_SIZE);
              }}
              className={`rounded-full px-3 py-2 ${
                active ? "bg-slate-900" : "bg-slate-100"
              }`}
            >
              <Text
                className="text-[12px] font-semibold"
                style={{ color: active ? "#FFFFFF" : "#0F172A" }}
              >
                {tab.label} ({count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 flex-row items-center">
        <Ionicons name="search" size={16} color="#94A3B8" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search guest by name..."
          placeholderTextColor="#94A3B8"
          className="ml-2 flex-1 text-[13px] text-slate-900"
          style={{ paddingVertical: 0 }}
        />
      </View>

      <View className="mt-2 rounded-2xl border border-slate-200 bg-white">
        <View className="flex-row border-b border-slate-100 px-3 py-2">
          <Text className="text-[12px] font-semibold text-slate-600" style={{ flex: 2 }}>
            Name
          </Text>
          <Text className="text-[12px] font-semibold text-slate-600" style={{ flex: 1 }}>
            Ticket
          </Text>
          <Text className="text-[12px] font-semibold text-slate-600" style={{ flex: 1 }}>
            Qty
          </Text>
          <Text className="text-[12px] font-semibold text-slate-600" style={{ flex: 1 }}>
            Status
          </Text>
        </View>

        {visibleItems.length === 0 ? (
          <View className="py-6 items-center">
            <Text className="text-[12px] text-slate-500">No results.</Text>
          </View>
        ) : (
          visibleItems.map((guest, idx) => (
            <View
              key={guest.id}
              className="flex-row px-3 py-3"
              style={{
                borderTopWidth: idx === 0 ? 0 : 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text className="text-[13px] text-slate-800" style={{ flex: 2 }}>
                {guest.name}
              </Text>
              <Text className="text-[13px] text-slate-600" style={{ flex: 1 }}>
                {guest.ticketType ?? "-"}
              </Text>
              <Text className="text-[13px] text-slate-600" style={{ flex: 1 }}>
                {guest.quantity ?? "-"}
              </Text>
              <Text className="text-[13px] text-slate-600 capitalize" style={{ flex: 1 }}>
                {guest.status}
              </Text>
            </View>
          ))
        )}
      </View>

      {hasMore ? (
        <Pressable
          onPress={() => setVisible((prev) => Math.min(prev + PAGE_SIZE, filtered.length))}
          className="mt-2 self-center rounded-full bg-slate-900 px-4 py-2"
        >
          <Text className="text-[13px] font-semibold text-white">Load more</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

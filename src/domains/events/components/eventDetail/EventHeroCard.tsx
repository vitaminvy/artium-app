import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventItem } from "../../../discover/types";

type RsvpStatus = "none" | "going" | "maybe" | "notGoing";

type Props = {
  event: EventItem;
  initialRsvp?: RsvpStatus;
  rsvp?: RsvpStatus;
  onChangeRsvp?: (status: RsvpStatus) => void;
};

const RSVP_META: Record<
  RsvpStatus,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  none: { label: "RSVP", color: "#0F172A", bg: "#FFFFFF", icon: "ellipse-outline" },
  going: { label: "Going", color: "#1D4ED8", bg: "#DBEAFE", icon: "checkmark-circle-outline" },
  maybe: { label: "Maybe", color: "#854D0E", bg: "#FEF3C7", icon: "help-circle-outline" },
  notGoing: { label: "Not Going", color: "#B91C1C", bg: "#FEE2E2", icon: "close-circle-outline" },
};

const RSVP_OPTIONS: RsvpStatus[] = ["going", "maybe", "notGoing"];

export default function EventHeroCard({
  event,
  initialRsvp = "none",
  rsvp,
  onChangeRsvp,
}: Props) {
  const [localRsvp, setLocalRsvp] = useState<RsvpStatus>(initialRsvp);
  const [openMenu, setOpenMenu] = useState(false);

  // Keep local state in sync with controlled prop or updated initial value
  useEffect(() => {
    if (rsvp !== undefined) {
      setLocalRsvp(rsvp);
    } else {
      setLocalRsvp(initialRsvp);
    }
  }, [rsvp, initialRsvp]);

  const displayedRsvp = rsvp ?? localRsvp;

  const month = useMemo(
    () => new Date(event.datetime).toLocaleString("en-US", { month: "short" }),
    [event.datetime]
  );
  const day = useMemo(
    () => new Date(event.datetime).getDate(),
    [event.datetime]
  );

  const handleSelect = (status: RsvpStatus) => {
    setLocalRsvp(status);
    onChangeRsvp?.(status);
    setOpenMenu(false);
  };

  return (
    <View className="rounded-3xl bg-white border border-slate-200 overflow-hidden">
      <View className="relative">
        <Image
          source={{ uri: event.image }}
          className="h-56 w-full bg-slate-100"
          resizeMode="cover"
        />
        <View className="absolute top-3 right-3 bg-white rounded-2xl px-2 py-2 items-center shadow-sm">
          <View className="rounded-full bg-[#0B73FF] px-2 py-0.5">
            <Text className="text-[11px] font-semibold text-white">{month}</Text>
          </View>
          <Text className="mt-1 text-xl font-extrabold text-[#0B1223] leading-6">
            {day}
          </Text>
        </View>
      </View>

      <View className="px-4 py-4 gap-3">
        {event.eventType ? (
          <View className="self-start rounded-full bg-slate-100 px-3 py-1">
            <Text className="text-[11px] font-semibold text-slate-700 uppercase">
              {event.eventType}
            </Text>
          </View>
        ) : null}

        <Text className="text-lg font-semibold text-slate-900">{event.title}</Text>

        <View className="flex-row items-center gap-2">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-full border"
            style={{
              backgroundColor: RSVP_META[displayedRsvp].bg,
              borderColor:
                displayedRsvp === "none" ? "#E2E8F0" : RSVP_META[displayedRsvp].bg,
            }}
            onPress={() => setOpenMenu((prev) => !prev)}
          >
            {displayedRsvp !== "none" ? (
              <Ionicons
                name={RSVP_META[displayedRsvp].icon}
                size={16}
                color={RSVP_META[displayedRsvp].color}
              />
            ) : null}
            <Text
              className="text-xs font-semibold"
              style={{ color: RSVP_META[displayedRsvp].color }}
            >
              {RSVP_META[displayedRsvp].label}
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={14}
              color={RSVP_META[displayedRsvp].color}
            />
          </Pressable>

          <Pressable className="h-11 w-11 rounded-full border border-slate-200 items-center justify-center active:opacity-90">
            <Ionicons name="mail-outline" size={18} color="#0F172A" />
          </Pressable>
          <Pressable className="h-11 w-11 rounded-full border border-slate-200 items-center justify-center active:opacity-90">
            <Ionicons name="share-outline" size={18} color="#0F172A" />
          </Pressable>
        </View>

        {openMenu ? (
          <View className="bg-white rounded-2xl border border-slate-200 shadow-lg">
            {RSVP_OPTIONS.map((status, idx) => (
              <Pressable
                key={status}
                className={`px-4 py-3 flex-row items-center gap-2 ${
                  idx < RSVP_OPTIONS.length - 1 ? "border-b border-slate-100" : ""
                }`}
                onPress={() => handleSelect(status)}
              >
                <Ionicons
                  name={RSVP_META[status].icon}
                  size={18}
                  color={RSVP_META[status].color}
                />
                <Text className="text-sm font-semibold text-slate-900">
                  {RSVP_META[status].label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

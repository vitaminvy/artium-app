import React, { useState } from "react";
import { View, Text, Image, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { EventItem } from "../../types";
import { Badge } from "../ui/DiscoverShared";
import { openShareLink } from "../../../../shared/utils/share";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

export default function EventCard({ item }: { item: EventItem }) {
  const date = new Date(item.datetime);
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();
  const [rsvp, setRsvp] = useState<"none" | "going" | "maybe" | "notGoing">(
    "none"
  );
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const RSVP_META: Record<
    typeof rsvp,
    {
      label: string;
      color: string;
      bg: string;
      icon: keyof typeof Ionicons.glyphMap;
    }
  > = {
    none: {
      label: item.rsvpLabel ?? "RSVP",
      color: "#0F172A",
      bg: "#FFFFFF",
      icon: "ellipse-outline",
    },
    going: {
      label: "Going",
      color: "#1D4ED8",
      bg: "#DBEAFE",
      icon: "checkmark-circle-outline",
    },
    maybe: {
      label: "Maybe",
      color: "#854D0E",
      bg: "#FEF3C7",
      icon: "help-circle-outline",
    },
    notGoing: {
      label: "Not Going",
      color: "#B91C1C",
      bg: "#FEE2E2",
      icon: "close-circle-outline",
    },
  };

  return (
    <View
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={[cardShadow, { position: "relative" as const }]}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="h-40 w-full"
          resizeMode="cover"
        />
        <View className="absolute top-3 right-3 bg-white rounded-2xl px-3 py-2 items-center shadow-sm">
          <Text className="text-[11px] font-semibold text-[#0B73FF]">
            {month}
          </Text>
          <Text className="text-lg font-extrabold text-[#0B1223] leading-5">
            {day}
          </Text>
        </View>
      </View>

      <View className="px-4 py-4 gap-2">
        <View className="flex-row items-center gap-2">
          {item.status ? (
            <Badge
              label={item.status === "ongoing" ? "ONGOING" : "UPCOMING"}
              color={item.status === "ongoing" ? "#22C55E" : "#2563EB"}
              ghost
            />
          ) : null}
          {item.attendees ? (
            <Text className="text-xs text-slate-500">
              {item.attendees} attendees
            </Text>
          ) : null}
        </View>

        <Text className="text-base font-semibold text-slate-900">
          {item.title}
        </Text>
        <Text className="text-xs text-slate-500">{item.location}</Text>

        <View className="flex-row items-center gap-2 mt-2">
          <Pressable
            className="flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-full border active:opacity-90"
            style={{
              backgroundColor: RSVP_META[rsvp].bg,
              borderColor: rsvp === "none" ? "#E2E8F0" : RSVP_META[rsvp].bg,
            }}
            onPress={() => setShowMenu((prev) => !prev)}
          >
            {rsvp !== "none" ? (
              <Ionicons
                name={RSVP_META[rsvp].icon}
                size={16}
                color={RSVP_META[rsvp].color}
              />
            ) : null}
            <Text
              className="text-xs font-semibold"
              style={{ color: RSVP_META[rsvp].color }}
            >
              {RSVP_META[rsvp].label}
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={14}
              color={RSVP_META[rsvp].color}
            />
          </Pressable>
          <Pressable className="h-11 w-11 rounded-full border border-slate-200 items-center justify-center active:opacity-90">
            <Ionicons name="mail-outline" size={18} color="#0F172A" />
          </Pressable>
          <Pressable
            className="h-11 w-11 rounded-full border border-slate-200 items-center justify-center active:opacity-90"
            onPress={() => setShowShare(true)}
          >
            <Ionicons name="share-outline" size={18} color="#0F172A" />
          </Pressable>
        </View>

        {showMenu ? (
          <View
            className="mt-2 bg-white rounded-2xl border border-slate-200 shadow-lg"
            style={{ zIndex: 10 }}
          >
            {[
              { key: "going", label: "Going" },
              { key: "maybe", label: "Maybe" },
              { key: "notGoing", label: "Not Going" },
            ].map((opt, idx) => (
              <Pressable
                key={opt.key}
                className={`px-4 py-3 flex-row items-center gap-2 ${
                  idx < 2 ? "border-b border-slate-100" : ""
                }`}
                onPress={() => {
                  setRsvp(opt.key as any);
                  setShowMenu(false);
                }}
              >
                <Ionicons
                  name={RSVP_META[opt.key as keyof typeof RSVP_META].icon}
                  size={18}
                  color={RSVP_META[opt.key as keyof typeof RSVP_META].color}
                />
                <Text className="text-sm font-semibold text-slate-900">
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {showShare ? (
          <Modal
            transparent
            animationType="fade"
            onRequestClose={() => setShowShare(false)}
          >
            <View className="flex-1 bg-black/35 justify-center items-center px-4">
              <Pressable
                className="absolute inset-0"
                onPress={() => setShowShare(false)}
              />
              <View className="w-full rounded-3xl bg-white p-4 gap-4 shadow-2xl">
                <View className="flex-row justify-between">
                  {[
                    { icon: "logo-whatsapp" as const, color: "#25D366", key: "whatsapp" },
                    { icon: "logo-facebook" as const, color: "#1877F2", key: "facebook" },
                    { icon: "logo-twitter" as const, color: "#000000", key: "twitter" },
                    { icon: "logo-linkedin" as const, color: "#0A66C2", key: "linkedin" },
                    { icon: "paper-plane-outline" as const, color: "#0EA5E9", key: "telegram" },
                  ].map((opt, idx) => (
                    <Pressable
                      key={idx}
                      className="h-14 w-14 rounded-full bg-slate-100 items-center justify-center active:opacity-80"
                      onPress={() =>
                        openShareLink(
                          opt.key as any,
                          `https://www.artium.com/event/${item.id ?? "link"}`,
                          item.title
                        )
                      }
                    >
                      <Ionicons name={opt.icon} size={22} color={opt.color} />
                    </Pressable>
                  ))}
                </View>
                <View className="flex-row items-center rounded-2xl border border-slate-200 px-3 py-3">
                  <Text className="flex-1 text-sm text-slate-800">
                    https://www.artium.com/event/{item.id ?? "link"}
                  </Text>
                  <Pressable
                    onPress={async () => {
                      const url = `https://www.artium.com/event/${item.id ?? "link"}`;
                      await Clipboard.setStringAsync(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <Text className="text-sm font-semibold text-[#0B73FF]">
                      {copied ? "Copied" : "Copy"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        ) : null}
      </View>
    </View>
  );
}

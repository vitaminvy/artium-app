import React from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventDetail } from "../../types";

type Props = {
  detail: EventDetail;
};

const Row = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View className="flex-row items-start gap-3">
    <Ionicons name={icon} size={16} color="#0F172A" />
    <Text className="flex-1 text-[13px] text-slate-800">{text}</Text>
  </View>
);

export default function OverviewCard({ detail }: Props) {
  const { overview } = detail;
  const start = new Date(overview.start);
  const end = new Date(overview.end);
  const dateLabel = `${start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })} - ${end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
  const timeLabel = `${start.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${end.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} (${overview.timeZone})`;

  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5 gap-4">
      <View className="gap-3">
        <Text className="text-[13px] font-semibold text-slate-900">Overview</Text>
        <Row icon="location-outline" text={overview.location} />
        <Row icon="calendar-outline" text={dateLabel} />
        <Row icon="time-outline" text={timeLabel} />
        <Row icon="globe-outline" text={overview.visibility} />
      </View>

      <View className="mt-2">
        <Text className="text-[13px] font-semibold text-slate-900">About this event</Text>
        <Text className="mt-2 text-[13px] leading-5 text-slate-800">
          {overview.description}
        </Text>
      </View>

      <View className="mt-3">
        <Text className="text-[13px] font-semibold text-slate-900">Organized by</Text>
        <View className="mt-2 flex-row items-center gap-3">
          {overview.organizer.avatar ? (
            <Image
              source={{ uri: overview.organizer.avatar }}
              className="h-10 w-10 rounded-full bg-slate-200"
            />
          ) : (
            <View className="h-10 w-10 rounded-full bg-slate-200" />
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-[13px] font-semibold text-slate-900">
                {overview.organizer.name}
              </Text>
              {overview.organizer.verified ? (
                <Ionicons name="checkmark-circle" size={14} color="#0B73FF" />
              ) : null}
            </View>
            {overview.organizer.handle ? (
              <Text className="text-[12px] text-slate-500">
                {overview.organizer.handle}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { HomeEventItem } from "../../types";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

type Props = {
  item: HomeEventItem;
  onPress?: (item: HomeEventItem) => void;
  width?: number;
  height?: number;
};

export default function HomeEventCard({ item, onPress, width, height }: Props) {
  const Container = onPress ? Pressable : View;
  const cardHeight = height ?? 150;
  const imageHeight = Math.round(cardHeight * 0.55);
  const calendarInfo = parseCalendarInfo(item.dateISO ?? item.dateLabel);
  const month = calendarInfo?.month;
  const day = calendarInfo?.day;
  const showCalendar = !!month && !!day;

  return (
    <Container
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={[cardShadow, { width: width ?? 260, height: cardHeight }]}
      onPress={() => onPress?.(item)}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: imageHeight }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
        {showCalendar ? (
          <View className="absolute top-3 right-3 rounded-2xl bg-white px-3 py-2 shadow-sm">
            <Text className="text-[10px] font-semibold text-[#2563EB]">
              {month}
            </Text>
            <Text className="text-[16px] font-extrabold text-slate-900 leading-4">
              {day}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-1 px-3 py-3 justify-center">
        <Text className="text-[10px] font-semibold text-slate-400">
          {item.label ?? "UPCOMING EVENT"}
        </Text>
        <Text
          className="text-[14px] font-semibold text-slate-900 leading-5 mt-1"
          numberOfLines={2}
        >
          {item.title}
        </Text>
      </View>
    </Container>
  );
}

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const MONTH_KEY_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function parseCalendarInfo(value?: string) {
  if (!value) return null;

  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const monthIndex = Number(isoMatch[2]) - 1;
    const day = String(Number(isoMatch[3]));
    if (monthIndex >= 0 && monthIndex < 12) {
      return { month: MONTHS[monthIndex], day };
    }
  }

  const monthMatch = value.match(/[A-Za-z]{3,}/);
  const dayMatch = value.match(/\b(\d{1,2})\b/);
  if (monthMatch && dayMatch) {
    const key = monthMatch[0].slice(0, 3).toLowerCase();
    const monthIndex = MONTH_KEY_MAP[key];
    if (monthIndex !== undefined) {
      return { month: MONTHS[monthIndex], day: dayMatch[1] };
    }
  }

  return null;
}

import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PROFILE_ACCENT, PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileMoodboard, ProfileViewModel } from "../../../types";

type Props = {
  profile: ProfileViewModel;
};

export default function ProfileMoodboardsTab({ profile }: Props) {
  return (
    <View className="pt-3 px-4 pb-6">
      <Pressable
        className="self-center rounded-full border border-slate-200 bg-white px-6 py-3 shadow-sm"
        hitSlop={6}
      >
        <Text className="text-sm font-semibold text-slate-800">
          {PROFILE_STRINGS.moodboardCta}
        </Text>
      </Pressable>

      <View className="mt-5" style={{ rowGap: 14 }}>
        {profile.moodboards.map((mb) => (
          <MoodboardCard key={mb.id} moodboard={mb} />
        ))}
      </View>
    </View>
  );
}

function MoodboardCard({ moodboard }: { moodboard: ProfileMoodboard }) {
  const ownerInitial =
    moodboard.ownerName?.charAt(0)?.toUpperCase?.() ?? "A";

  return (
    <View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center" style={{ columnGap: 8 }}>
          {moodboard.visibility === "private" ? (
            <Badge icon="lock-closed-outline" label="Private" />
          ) : (
            <Badge icon="globe-outline" label="Public" />
          )}
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
      </View>

      <View className="h-36 mb-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 overflow-hidden">
        <View
          className="flex-1 m-3 rounded-xl"
          style={{ backgroundColor: moodboard.previewColor ?? "#F1F5F9" }}
        />
      </View>

      <View className="flex-row items-center" style={{ columnGap: 10 }}>
        <View
          className="h-8 w-8 rounded-full items-center justify-center"
          style={{ backgroundColor: PROFILE_ACCENT }}
        >
          <Text className="font-semibold text-slate-900 text-sm">
            {ownerInitial}
          </Text>
        </View>
        <View>
          <Text className="text-base font-semibold text-slate-900">
            {moodboard.title}
          </Text>
          <Text className="text-xs text-slate-500">by {moodboard.ownerName}</Text>
        </View>
      </View>
    </View>
  );
}

function Badge({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View className="flex-row items-center rounded-full bg-slate-900 px-3 py-1.5">
      <Ionicons name={icon} size={14} color="#FFFFFF" />
      <Text className="ml-2 text-[11px] font-semibold text-white uppercase tracking-[0.5px]">
        {label}
      </Text>
    </View>
  );
}

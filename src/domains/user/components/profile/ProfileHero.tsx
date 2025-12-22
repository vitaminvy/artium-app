import React from "react";
import { View, Text, Image } from "react-native";
import { PROFILE_ACCENT } from "../../constants/profile";
import { ProfileStats, ProfileUser } from "../../types";

type Props = {
  user: ProfileUser;
  stats: ProfileStats;
};

export default function ProfileHero({ user, stats }: Props) {
  const initial = user.avatarLabel ?? user.name?.charAt(0) ?? "?";
  const avatarColor = user.avatarColor ?? PROFILE_ACCENT;
  const hasAvatar = typeof user.avatarUri === "string" && user.avatarUri.length > 0;
  const showLogo = user.avatarUri === null;
  const fallbackLogo = require("../../../../../assets/logos/logo-light-mode.png");

  return (
    <View className="items-center pt-6 pb-4 px-6">
      <View
        className="h-24 w-24 rounded-full items-center justify-center shadow-sm overflow-hidden"
        style={{ backgroundColor: hasAvatar || showLogo ? "white" : avatarColor }}
      >
        {hasAvatar ? (
          <Image
            source={{ uri: user.avatarUri as string }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : showLogo ? (
          <Image
            source={fallbackLogo}
            style={{ width: "65%", height: "65%" }}
            resizeMode="contain"
          />
        ) : (
          <Text className="text-4xl font-extrabold text-slate-900">
            {initial}
          </Text>
        )}
      </View>

      <Text className="mt-3 text-xl font-semibold text-slate-900">
        {user.name}
      </Text>
      <Text className="text-sm text-slate-500">{user.handle}</Text>

      <View className="flex-row items-center mt-4" style={{ columnGap: 24 }}>
        <StatBlock label="Followers" value={stats.followers} />
        <View className="h-6 w-px bg-slate-200" />
        <StatBlock label="Following" value={stats.following} />
      </View>
    </View>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-semibold text-slate-900">{value}</Text>
      <Text className="text-xs text-slate-500">{label}</Text>
    </View>
  );
}

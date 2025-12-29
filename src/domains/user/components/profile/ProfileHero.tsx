import React, { useCallback, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { PROFILE_ACCENT } from "../../constants/profile";
import { ProfileStats, ProfileUser } from "../../types";

type Props = {
  user: ProfileUser;
  stats: ProfileStats;
  onAvatarLoad?: () => void;
};

export default function ProfileHero({ user, stats, onAvatarLoad }: Props) {
  const initial = user.avatarLabel ?? user.name?.charAt(0) ?? "?";
  const avatarColor = user.avatarColor ?? PROFILE_ACCENT;
  const hasAvatar = typeof user.avatarUri === "string" && user.avatarUri.length > 0;
  const showLogo = user.avatarUri === null;
  const fallbackLogo = require("../../../../../assets/logos/logo-light-mode.png");
  const notifiedRef = useRef(false);

  useEffect(() => {
    notifiedRef.current = false;
  }, [user.avatarUri]);

  const notifyAvatarLoad = useCallback(() => {
    if (!onAvatarLoad || notifiedRef.current) return;
    notifiedRef.current = true;
    onAvatarLoad();
  }, [onAvatarLoad]);

  useEffect(() => {
    if (!hasAvatar) {
      notifyAvatarLoad();
    }
  }, [hasAvatar, notifyAvatarLoad]);

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
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
            onLoadEnd={notifyAvatarLoad}
            onError={notifyAvatarLoad}
          />
        ) : showLogo ? (
          <Image
            source={fallbackLogo}
            style={{ width: "65%", height: "65%" }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={0}
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

import React from "react";
import { View, Pressable, Text } from "react-native";
import { PROFILE_TABS } from "../../constants/profile";
import { ProfileTabKey } from "../../types";

type Props = {
  tab: ProfileTabKey;
  onChange: (tab: ProfileTabKey) => void;
};

export default function ProfileTabBar({ tab, onChange }: Props) {
  return (
    <View className="px-3 pb-3">
      <View className="flex-row items-center justify-between rounded-2xl border border-slate-200 bg-white px-1 py-1">
        {PROFILE_TABS.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              className={`flex-1 items-center justify-center rounded-xl py-3 ${
                active ? "bg-slate-900" : ""
              }`}
            >
              <Text
                className={`text-xs font-semibold uppercase tracking-[0.3px] ${
                  active ? "text-white" : "text-slate-600"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

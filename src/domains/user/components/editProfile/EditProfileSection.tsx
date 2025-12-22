import React from "react";
import { View, Text } from "react-native";

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function EditProfileSection({ title, children }: Props) {
  return (
    <View className="bg-white rounded-3xl border border-slate-200 px-4 py-4 shadow-sm">
      <Text className="text-xl font-semibold text-slate-900 mb-3">
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

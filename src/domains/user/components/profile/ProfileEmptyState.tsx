import React from "react";
import { View, Text } from "react-native";

type Props = {
  message: string;
};

export default function ProfileEmptyState({ message }: Props) {
  return (
    <View className="items-center justify-center px-6 py-8">
      <TileStack />
      <Text className="mt-6 text-sm text-center text-slate-500">
        {message}
      </Text>
    </View>
  );
}

function TileStack() {
  return (
    <View className="items-center">
      <View
        className="h-36 w-28 rounded-3xl border border-dashed border-slate-200 bg-white shadow-sm"
        style={{ transform: [{ rotate: "-4deg" }] }}
      />
      <View className="absolute top-6">
        <View
          className="h-36 w-28 rounded-3xl border border-dashed border-slate-200 bg-white shadow-sm"
          style={{ transform: [{ rotate: "6deg" }] }}
        />
      </View>
      <View className="absolute top-12">
        <View className="h-24 w-20 rounded-2xl border border-slate-200 bg-white shadow-sm items-center justify-center">
          <Text className="text-2xl text-slate-400">+</Text>
        </View>
      </View>
    </View>
  );
}

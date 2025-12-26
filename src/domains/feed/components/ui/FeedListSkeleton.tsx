import React from "react";
import { View } from "react-native";

type Props = {
  count?: number;
};

export default function FeedListSkeleton({ count = 4 }: Props) {
  return (
    <View className="px-3 pt-2 gap-3 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={`feed-skeleton-${index}`}
          className="rounded-[28px] border border-slate-200 bg-white px-4 py-3"
        >
          <View className="flex-row items-center gap-3 mb-3">
            <View className="h-10 w-10 rounded-full bg-slate-200" />
            <View className="flex-1 gap-2">
              <View className="h-4 w-36 rounded bg-slate-200" />
              <View className="h-3 w-24 rounded bg-slate-200" />
            </View>
          </View>
          <View className="h-3 w-full rounded bg-slate-200 mb-2" />
          <View className="h-3 w-5/6 rounded bg-slate-200 mb-3" />
          <View className="h-40 rounded-2xl bg-slate-200 mb-3" />
          <View className="flex-row items-center gap-6">
            <View className="h-4 w-10 rounded bg-slate-200" />
            <View className="h-4 w-10 rounded bg-slate-200" />
            <View className="h-4 w-10 rounded bg-slate-200" />
            <View className="h-4 w-10 rounded bg-slate-200" />
          </View>
        </View>
      ))}
    </View>
  );
}

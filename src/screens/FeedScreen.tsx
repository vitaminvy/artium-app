// Feed Screen
// src/screens/FeedScreen.tsx
import React, { useMemo, useState } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import FeedCard from "../shared/components/FeedCard";
import { SAMPLE_FEED, FeedItem } from "../shared/constants/feed";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const [feedData, setFeedData] = useState<FeedItem[]>(() => SAMPLE_FEED);

  return (
    <View className="flex-1 bg-slate-50 pt-4">
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 80, 100),
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => {}} />
        }
      >
        {feedData.map((item) => (
          <FeedCard
            key={item.id}
            {...item}
            onPressLike={() => {
              setFeedData((prev) =>
                prev.map((it) =>
                  it.id === item.id
                    ? {
                        ...it,
                        liked: !it.liked,
                        likes: (it.likes ?? 0) + (it.liked ? -1 : 1),
                      }
                    : it
                )
              );
            }}
            onPressRepost={() => {
              setFeedData((prev) =>
                prev.map((it) =>
                  it.id === item.id
                    ? {
                        ...it,
                        reposted: !it.reposted,
                        reposts: (it.reposts ?? 0) + (it.reposted ? -1 : 1),
                      }
                    : it
                )
              );
            }}
            onPressComment={() => {
              console.log("Open comments for", item.id);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
}

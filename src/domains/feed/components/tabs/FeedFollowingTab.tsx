import React from "react";
import { FlatList, ListRenderItemInfo, View, Text } from "react-native";
import { FeedPost } from "../../types";
import FeedPostCard from "../cards/FeedPostCard";

type Props = {
  data: FeedPost[];
  onToggleLike: (id: string) => void;
  onToggleReshare: (post: FeedPost) => void;
  onPressComment: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
  onScrollY?: (offsetY: number) => void;
};

export default function FeedFollowingTab({
  data,
  onToggleLike,
  onToggleReshare,
  onPressComment,
  onPressCard,
  onScrollY,
}: Props) {
  const renderItem = ({ item }: ListRenderItemInfo<FeedPost>) => (
    <FeedPostCard
      post={item}
      onPressLike={onToggleLike}
      onPressReshare={onToggleReshare}
      onPressComment={onPressComment}
      onPressCard={onPressCard}
    />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListHeaderComponent={
        data.some((p) => p.author.isMe) ? (
          <View className="px-4 py-2">
            <Text className="text-xs font-semibold text-slate-500">
              Your newest moments are pinned on top
            </Text>
          </View>
        ) : null
      }
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 4,
        paddingBottom: 120,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      showsVerticalScrollIndicator={false}
      onScroll={(e) => onScrollY?.(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
    />
  );
}

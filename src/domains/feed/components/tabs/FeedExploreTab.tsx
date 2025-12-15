import React from "react";
import { FlatList, ListRenderItemInfo, View } from "react-native";
import { FeedPost } from "../../types";
import FeedPostCard from "../cards/FeedPostCard";

type Props = {
  data: FeedPost[];
  onToggleLike: (id: string) => void;
  onToggleReshare: (post: FeedPost) => void;
  onPressComment: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
};

export default function FeedExploreTab({
  data,
  onToggleLike,
  onToggleReshare,
  onPressComment,
  onPressCard,
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
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 120,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

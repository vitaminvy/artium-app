import React from "react";
import { ListRenderItemInfo, View } from "react-native";
import Animated from "react-native-reanimated";
import { FeedPost } from "../../types";
import FeedPostCard from "../cards/FeedPostCard";

type Props = {
  data: FeedPost[];
  onToggleLike: (id: string) => void;
  onToggleReshare: (post: FeedPost) => void;
  onPressComment: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
  scrollHandler?: any;
};

export default function FeedExploreTab({
  data,
  onToggleLike,
  onToggleReshare,
  onPressComment,
  onPressCard,
  scrollHandler,
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

  const AnimatedFlatList = Animated.FlatList as unknown as typeof Animated.FlatList<FeedPost>;

  return (
    <AnimatedFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      updateCellsBatchingPeriod={50}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 8,
        paddingBottom: 120,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      showsVerticalScrollIndicator={false}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    />
  );
}

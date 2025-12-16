import React, { useCallback, useMemo } from "react";
import { ListRenderItemInfo, View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { FeedPost } from "../../types";
import FeedPostCard from "../cards/FeedPostCard";

type Props = {
  data: FeedPost[];
  onToggleLike: (id: string) => void;
  onToggleReshare: (post: FeedPost) => void;
  onPressComment: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
  onPressImage?: (images: { uri: string }[], index: number) => void;
  scrollHandler?: any;
};

export default function FeedFollowingTab({
  data,
  onToggleLike,
  onToggleReshare,
  onPressComment,
  onPressCard,
  onPressImage,
  scrollHandler,
}: Props) {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedPost>) => (
      <FeedPostCard
        post={item}
        onPressLike={onToggleLike}
        onPressReshare={onToggleReshare}
        onPressComment={onPressComment}
        onPressCard={onPressCard}
        onPressImage={onPressImage}
      />
    ),
    [onToggleLike, onToggleReshare, onPressComment, onPressCard, onPressImage]
  );

  const AnimatedFlatList = useMemo(
    () => Animated.FlatList as unknown as typeof Animated.FlatList<FeedPost>,
    []
  );

  return (
    <AnimatedFlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={7}
      updateCellsBatchingPeriod={50}
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
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    />
  );
}

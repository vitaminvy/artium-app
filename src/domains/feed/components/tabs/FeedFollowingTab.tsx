import React, { useCallback, useMemo, useState } from "react";
import { ListRenderItemInfo, View, Text, ViewToken } from "react-native";
import Animated from "react-native-reanimated";
import { FeedPost } from "../../types";
import FeedPostCard from "../cards/FeedPostCard";

type Props = {
  data: FeedPost[];
  onToggleLike: (id: string, isCurrentlyLiked: boolean) => void | Promise<void>;
  onToggleReshare: (post: FeedPost) => void;
  onPressComment: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
  onPressImage?: (images: { uri: string }[], index: number) => void;
  scrollHandler?: any;
  isTabActive?: boolean;
};

export default function FeedFollowingTab({
  data,
  onToggleLike,
  onToggleReshare,
  onPressComment,
  onPressCard,
  onPressImage,
  scrollHandler,
  isTabActive = true,
}: Props) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Clear active video when tab becomes inactive
  React.useEffect(() => {
    if (!isTabActive) {
      setActiveVideoId(null);
    }
  }, [isTabActive]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      // Filter viewable items with video only
      const videoItems = viewableItems.filter((token) => {
        if (!token.isViewable || !token.item) return false;
        const post = token.item as FeedPost;
        return post.media?.type === "video";
      });

      if (videoItems.length === 0) {
        setActiveVideoId(null);
        return;
      }

      // Pick the first viewable video item (center-most on screen)
      // FlatList provides items in visibility order
      const centerItem = videoItems[0];
      if (centerItem && centerItem.item) {
        const post = centerItem.item as FeedPost;
        setActiveVideoId(post.id);
      } else {
        setActiveVideoId(null);
      }
    },
    []
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 75,
      minimumViewTime: 150,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FeedPost>) => {
      const isActive = item.id === activeVideoId;
      const hasVideo = item.media?.type === "video";

      return (
        <FeedPostCard
          post={item}
          onPressLike={onToggleLike}
          onPressReshare={onToggleReshare}
          onPressComment={onPressComment}
          onPressCard={onPressCard}
          onPressImage={onPressImage}
          isVisible={hasVideo ? (isTabActive && isActive) : true}
        />
      );
    },
    [onToggleLike, onToggleReshare, onPressComment, onPressCard, onPressImage, activeVideoId, isTabActive]
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
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
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

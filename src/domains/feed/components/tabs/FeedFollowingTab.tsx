import React, { useCallback, useMemo, useRef, useState } from "react";
import { ListRenderItemInfo, View, Text, ViewToken } from "react-native";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";
import { FeedPost } from "../../types";
import FeedPostCard from "../cards/FeedPostCard";
import FeedListSkeleton from "../ui/FeedListSkeleton";

type Props = {
  data: FeedPost[];
  onToggleLike: (id: string, isLiked: boolean) => void | Promise<void>;
  onToggleReshare: (post: FeedPost) => void;
  onPressComment: (post: FeedPost) => void;
  onPressCard?: (post: FeedPost) => void;
  onPressImage?: (images: { uri: string }[], index: number) => void;
  scrollHandler?: any;
  isTabActive?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
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
  isRefreshing,
  onRefresh,
  isLoading,
}: Props) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [avatarExpected, setAvatarExpected] = useState(0);
  const [avatarLoaded, setAvatarLoaded] = useState(0);
  const loadedAvatarIds = useRef<Set<string>>(new Set());
  const avatarsReady = avatarExpected === 0 || avatarLoaded >= avatarExpected;

  // Clear active video when tab becomes inactive
  React.useEffect(() => {
    if (!isTabActive) {
      setActiveVideoId(null);
    }
  }, [isTabActive]);

  React.useEffect(() => {
    if (!isTabActive) return;
    const expectedIds = new Set(data.slice(0, 6).map((post) => post.id));
    const retained = new Set(
      [...loadedAvatarIds.current].filter((id) => expectedIds.has(id))
    );
    loadedAvatarIds.current = retained;
    setAvatarExpected(expectedIds.size);
    setAvatarLoaded(retained.size);
  }, [data, isTabActive]);

  React.useEffect(() => {
    if (!isTabActive) return;
    const avatarUrls = data
      .slice(0, 6)
      .map((post) => post.author?.avatar)
      .filter((uri): uri is string => typeof uri === "string" && uri.length > 0);
    if (avatarUrls.length) {
      Image.prefetch(avatarUrls);
    }
  }, [data, isTabActive]);

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
          onAvatarLoad={(postId) => {
            if (!avatarExpected) return;
            if (loadedAvatarIds.current.has(postId)) return;
            loadedAvatarIds.current.add(postId);
            setAvatarLoaded((prev) => Math.min(prev + 1, avatarExpected));
          }}
        />
      );
    },
    [
      onToggleLike,
      onToggleReshare,
      onPressComment,
      onPressCard,
      onPressImage,
      activeVideoId,
      avatarExpected,
      isTabActive,
    ]
  );

  const AnimatedFlatList = useMemo(
    () => Animated.FlatList as unknown as typeof Animated.FlatList<FeedPost>,
    []
  );

  const showSkeleton = !!isTabActive && (isLoading || !avatarsReady);

  return (
    <View className="flex-1">
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
        onRefresh={onRefresh}
        refreshing={isRefreshing}
      />
      {showSkeleton ? (
        <View className="absolute inset-0 bg-white" pointerEvents="none">
          <FeedListSkeleton />
        </View>
      ) : null}
    </View>
  );
}

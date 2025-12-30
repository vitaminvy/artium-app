// Feed Screen
// src/screens/FeedScreen.tsx
import React from "react";
import { View, Text, Keyboard } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import FeedTabs from "../domains/feed/components/ui/FeedTabs";
import FeedExploreTab from "../domains/feed/components/tabs/FeedExploreTab";
import FeedFollowingTab from "../domains/feed/components/tabs/FeedFollowingTab";
import { useFeed } from "../domains/feed/hooks/useFeed";
import { FEED_STRINGS } from "../domains/feed/constants";
import { FeedPost } from "../domains/feed/types";
import ReshareSheet from "../domains/feed/components/sheets/ReshareSheet";
import CommentsSheet from "../domains/feed/components/sheets/CommentsSheet";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FeedStackParamList } from "../app/navigation/Stack/FeedStack";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import PostMomentSheet from "../domains/feed/components/PostMomentSheet";
import { usePostMoment } from "../domains/feed/hooks/usePostMoment";
import ImageViewing from "react-native-image-viewing";
import { useRef, useEffect } from "react";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { useAuth } from "../domains/auth/contexts/AuthContext";
import { getArtworkById } from "../domains/artwork/services/artworkService";
import { navigate as rootNavigate } from "../app/navigation/navigationRef";
import { useUnreadNotificationsCount } from "../domains/notifications/hooks/useUnreadCount";

export default function FeedScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const route = useRoute<RouteProp<FeedStackParamList, "FeedMain">>();
  const { currentUser: user } = useAuth();
  const unreadCount = useUnreadNotificationsCount();
  const {
    tab,
    setTab,
    loading,
    error,
    isRefreshing,
    onRefresh,
    explorePosts,
    followingPosts,
    myPosts, // Add this
    loadMorePosts,
    hasMorePosts,
    isMorePostsLoading,
    toggleLike,
    createReshare,
    addComment,
    addMomentPost,
  } = useFeed(user);
  const postMoment = usePostMoment({
    onPublish: async (post) => {
      await addMomentPost({ content: post.content, media: post.media });
    },
    onShared: () => {
      navigation.getParent()?.navigate("Feed");
    },
  });

  const [selectedPost, setSelectedPost] = React.useState<FeedPost | undefined>();
  const [commentTarget, setCommentTarget] = React.useState<FeedPost | undefined>();
  const lastRefreshKey = useRef<number | undefined>(undefined);
  const viewerKeyRef = useRef(0);
  const [viewerState, setViewerState] = React.useState<{
    visible: boolean;
    images: { uri: string }[];
    initialIndex: number;
    key: string;
  }>({ visible: false, images: [], initialIndex: 0, key: "viewer-0" });
  const TAB_HEIGHT = 52;
  const tabsAnim = useSharedValue(1);
  const lastOffset = useSharedValue(0);
  const { setHidden } = useTabBarVisibility();
  const refreshKey = route.params?.refreshKey;

  useEffect(() => {
    if (!refreshKey || refreshKey === lastRefreshKey.current) return;
    lastRefreshKey.current = refreshKey;
    onRefresh();
  }, [onRefresh, refreshKey]);

  const openReshare = React.useCallback((post: FeedPost) => {
    setSelectedPost(post);
  }, []);

  const closeReshare = React.useCallback(() => {
    setSelectedPost(undefined);
  }, []);

  const submitReshare = React.useCallback((note: string) => {
    if (!selectedPost) return;
    createReshare(selectedPost, note); // Pass the full post object
    closeReshare();
  }, [closeReshare, createReshare, selectedPost]);

  const openDetail = React.useCallback((post: FeedPost) => {
    navigation.navigate("FeedDetail", { post });
  }, [navigation]);

  const openQuote = React.useCallback((quoteId: string) => {
    if (!quoteId) return;
    const allPosts = [...explorePosts, ...followingPosts, ...myPosts];
    const target = allPosts.find((p) => p.id === quoteId);
    if (target) {
      navigation.navigate("FeedDetail", { post: target });
      return;
    }
    // Fallback: try fetch post, then artwork detail (do not abort on post fetch errors)
    import("../domains/feed/services/feedService")
      .then(({ getPostById }) => getPostById(quoteId))
      .catch((err) => {
        console.warn("Failed to fetch quoted post, will try artwork:", err);
        return null;
      })
      .then(async (post) => {
        if (post) {
          navigation.navigate("FeedDetail", { post });
          return;
        }
        try {
          const artwork = await getArtworkById(quoteId, user?.uid);
          if (artwork) {
            rootNavigate("ArtworkDetail", { id: quoteId });
          }
        } catch (err) {
          console.warn("Failed to fetch artwork for quote:", err);
        }
      });
  }, [explorePosts, followingPosts, myPosts, navigation, user?.uid]);

  const openComments = React.useCallback((post: FeedPost) => {
    setCommentTarget(post);
  }, []);

  const closeComments = React.useCallback(() => {
    setCommentTarget(undefined);
  }, []);

  const submitComment = React.useCallback((text: string) => {
    if (!commentTarget) return;
    addComment(commentTarget.id, text);
    Keyboard.dismiss();
  }, [addComment, commentTarget]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      const diff = y - lastOffset.value;
      if ((diff > 6 && y > 16) || y > 120) {
        tabsAnim.value = withTiming(0, { duration: 140 });
        runOnJS(setHidden)(true);
      } else if (diff < -6) {
        tabsAnim.value = withTiming(1, { duration: 140 });
        runOnJS(setHidden)(false);
      }
      lastOffset.value = y;
    },
  });

  useEffect(() => () => {
    setHidden(false);
  }, [setHidden]);

  const tabAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(tabsAnim.value, [0, 1], [0, TAB_HEIGHT]),
    opacity: tabsAnim.value,
    overflow: "hidden",
    transform: [{ translateY: interpolate(tabsAnim.value, [0, 1], [-TAB_HEIGHT / 2, 0]) }],
    pointerEvents: tabsAnim.value === 0 ? "none" : "auto",
  }));

  const handleOpenViewer = React.useCallback((images: { uri: string }[], index: number) => {
    viewerKeyRef.current += 1;
    const key = `viewer-${viewerKeyRef.current}-${images.length}-${index}`;
    setViewerState({ visible: false, images, initialIndex: index, key });
    requestAnimationFrame(() => {
      setViewerState((prev) => ({ ...prev, visible: true }));
    });
  }, []);

  const handleCloseViewer = React.useCallback(() => {
    setViewerState((prev) => ({ ...prev, visible: false }));
  }, []);
  
  const renderContent = () => {
    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-red-500 text-center">
            Failed to load feed. Please try again later.
          </Text>
        </View>
      );
    }
    return (
      <View className="flex-1">
        <View style={{ flex: 1, display: tab === "explore" ? "flex" : "none" }}>
          <FeedExploreTab
            data={explorePosts}
            onToggleLike={(id: string, isLiked: boolean) => toggleLike(id, isLiked)}
            onToggleReshare={openReshare}
            onPressComment={openComments}
            onPressCard={openDetail}
            onPressQuote={openQuote}
            onPressImage={handleOpenViewer}
            scrollHandler={scrollHandler}
            isTabActive={tab === "explore"}
            onEndReached={loadMorePosts}
            isFetchingNextPage={isMorePostsLoading}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            isLoading={loading}
          />
        </View>
        <View style={{ flex: 1, display: tab === "following" ? "flex" : "none" }}>
          <FeedFollowingTab
            data={followingPosts}
            onToggleLike={(id: string, isLiked: boolean) => toggleLike(id, isLiked)}
            onToggleReshare={openReshare}
            onPressComment={openComments}
            onPressCard={openDetail}
            onPressQuote={openQuote}
            onPressImage={handleOpenViewer}
            scrollHandler={scrollHandler}
            isTabActive={tab === "following"}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            isLoading={loading}
          />
        </View>
        <View style={{ flex: 1, display: tab === "myFeed" ? "flex" : "none" }}>
          <FeedExploreTab
            data={myPosts}
            onToggleLike={(id: string, isLiked: boolean) => toggleLike(id, isLiked)}
            onToggleReshare={openReshare}
            onPressComment={openComments}
            onPressCard={openDetail}
            onPressQuote={openQuote}
            onPressImage={handleOpenViewer}
            scrollHandler={scrollHandler}
            isTabActive={tab === "myFeed"}
            onEndReached={loadMorePosts} // Or a new function if my feed has separate pagination
            isFetchingNextPage={isMorePostsLoading}
            onRefresh={onRefresh}
            isRefreshing={isRefreshing}
            isLoading={loading}
          />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title={FEED_STRINGS.HEADER_TITLE}
        badgeLabel="Blog"
        onPressBadge={() => navigation.navigate("Blog")}
        actionType="notifications"
        onPressAction={() => {
          rootNavigate("Notifications");
        }}
        underlineSource={UnderlineHome}
        notificationCount={unreadCount}
      />

      <Animated.View style={[{ overflow: "hidden" }, tabAnimatedStyle]}>
        <FeedTabs tab={tab} onChange={setTab} tabs={['explore', 'following', 'myFeed']} />
      </Animated.View>

      {renderContent()}

      <ReshareSheet
        visible={!!selectedPost}
        target={selectedPost}
        onClose={closeReshare}
        onSubmit={submitReshare}
      />

      <CommentsSheet
        visible={!!commentTarget}
        target={commentTarget}
        onClose={closeComments}
        onSubmit={submitComment}
      />

      <PostMomentSheet
        visible={postMoment.state.visible}
        text={postMoment.state.text}
        media={postMoment.state.media}
        canShare={postMoment.state.canShare}
        onChangeText={postMoment.actions.setText}
        onPickImage={postMoment.actions.pickImage}
        onPickVideo={postMoment.actions.pickVideo}
        onRemoveMedia={postMoment.actions.removeMedia}
        onRemoveImageAt={postMoment.actions.removeImageAt}
        onVideoDuration={postMoment.actions.setVideoDuration}
        onShare={postMoment.actions.share}
        onClose={postMoment.actions.close}
        isVideoActive={postMoment.state.media?.type === "video"}
      />

      <ImageViewing
        key={viewerState.key}
        images={viewerState.images}
        imageIndex={viewerState.initialIndex}
        visible={viewerState.visible}
        onRequestClose={handleCloseViewer}
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        backgroundColor="black"
        animationType="none"
      />
    </View>
  );
}

// Feed Screen
// src/screens/FeedScreen.tsx
import React from "react";
import { View, Pressable, Text, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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
} from "react-native-reanimated";
import PostMomentSheet from "../domains/feed/components/PostMomentSheet";
import { usePostMoment } from "../domains/feed/hooks/usePostMoment";
import { subscribePostMomentOpen } from "../shared/utils/postMomentBridge";
import ImageViewing from "react-native-image-viewing";
import { useRef } from "react";

export default function FeedScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const {
    tab,
    setTab,
    explorePosts,
    followingPosts,
    toggleLike,
    createReshare,
    commentsByPost,
    addComment,
    addMomentPost,
  } = useFeed();
  const postMoment = usePostMoment({
    onPublish: addMomentPost,
  });
  React.useEffect(() => {
    const unsubscribe = subscribePostMomentOpen(postMoment.actions.open);
    return unsubscribe;
  }, [postMoment.actions.open]);
  const [selectedPost, setSelectedPost] = React.useState<
    FeedPost | undefined
  >();
  const [commentTarget, setCommentTarget] = React.useState<
    FeedPost | undefined
  >();
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

  const openReshare = React.useCallback((post: FeedPost) => {
    setSelectedPost(post);
  }, []);

  const closeReshare = React.useCallback(() => {
    setSelectedPost(undefined);
  }, []);

  const submitReshare = React.useCallback((note: string) => {
    if (!selectedPost) return;
    createReshare(selectedPost.id, note);
    closeReshare();
  }, [closeReshare, createReshare, selectedPost]);

  const openDetail = React.useCallback((post: FeedPost) => {
    navigation.navigate("FeedDetail", { post });
  }, [navigation]);

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
      // Nhạy hơn cho cuộn chậm: ngưỡng nhỏ và auto-ẩn khi đã vượt xa
      if ((diff > 6 && y > 16) || y > 120) {
        tabsAnim.value = withTiming(0, { duration: 140 });
      } else if (diff < -6) {
        tabsAnim.value = withTiming(1, { duration: 140 });
      }
      lastOffset.value = y;
    },
  });

  const tabAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(tabsAnim.value, [0, 1], [0, TAB_HEIGHT]),
    opacity: tabsAnim.value,
    overflow: "hidden",
    transform: [
      {
        translateY: interpolate(tabsAnim.value, [0, 1], [-TAB_HEIGHT / 2, 0]),
      },
    ],
    pointerEvents: tabsAnim.value === 0 ? "none" : "auto",
  }));

  const handleOpenViewer = React.useCallback((images: { uri: string }[], index: number) => {
    viewerKeyRef.current += 1;
    const key = `viewer-${viewerKeyRef.current}-${images.length}-${index}`;
    // Set images/index first, then flip visible on next frame to avoid race
    setViewerState({ visible: false, images, initialIndex: index, key });
    requestAnimationFrame(() => {
      setViewerState((prev) => ({ ...prev, visible: true }));
    });
  }, []);

  const handleCloseViewer = React.useCallback(() => {
    setViewerState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title={FEED_STRINGS.HEADER_TITLE}
        badgeLabel="Blog"
        actionType="notifications"
        onPressAction={() => console.log("Open notifications")}
        underlineSource={UnderlineHome}
      />

      <Animated.View style={[{ overflow: "hidden" }, tabAnimatedStyle]}>
        <FeedTabs tab={tab} onChange={setTab} />
      </Animated.View>

      <View className="flex-1">
        <View style={{ flex: 1, display: tab === "explore" ? "flex" : "none" }}>
          <FeedExploreTab
            data={explorePosts}
            onToggleLike={toggleLike}
            onToggleReshare={openReshare}
            onPressComment={openComments}
            onPressCard={openDetail}
            onPressImage={handleOpenViewer}
            scrollHandler={scrollHandler}
          />
        </View>
        <View style={{ flex: 1, display: tab === "following" ? "flex" : "none" }}>
          <FeedFollowingTab
            data={followingPosts}
            onToggleLike={toggleLike}
            onToggleReshare={openReshare}
            onPressComment={openComments}
            onPressCard={openDetail}
            onPressImage={handleOpenViewer}
            scrollHandler={scrollHandler}
          />
        </View>
      </View>

      <ReshareSheet
        visible={!!selectedPost}
        target={selectedPost}
        onClose={closeReshare}
        onSubmit={submitReshare}
      />

      <CommentsSheet
        visible={!!commentTarget}
        target={commentTarget}
        comments={commentTarget ? (commentsByPost[commentTarget.id] ?? []) : []}
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

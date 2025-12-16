// Feed Screen
// src/screens/FeedScreen.tsx
import React from "react";
import { View, Pressable, Text, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
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
  } = useFeed();
  const [selectedPost, setSelectedPost] = React.useState<
    FeedPost | undefined
  >();
  const [commentTarget, setCommentTarget] = React.useState<
    FeedPost | undefined
  >();
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
    </View>
  );
}

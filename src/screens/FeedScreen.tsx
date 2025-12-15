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
  const [reshareNote, setReshareNote] = React.useState("");
  const [commentTarget, setCommentTarget] = React.useState<
    FeedPost | undefined
  >();
  const [commentInput, setCommentInput] = React.useState("");
  const TAB_HEIGHT = 52;
  const tabsAnim = useSharedValue(1);
  const lastOffset = useSharedValue(0);

  const openReshare = (post: FeedPost) => {
    setSelectedPost(post);
    setReshareNote("");
  };

  const closeReshare = () => {
    setSelectedPost(undefined);
    setReshareNote("");
  };

  const submitReshare = () => {
    if (!selectedPost) return;
    createReshare(selectedPost.id, reshareNote);
    closeReshare();
  };

  const openDetail = (post: FeedPost) => {
    navigation.navigate("FeedDetail", { post });
  };

  const openComments = (post: FeedPost) => {
    setCommentTarget(post);
    setCommentInput("");
  };

  const closeComments = () => {
    setCommentTarget(undefined);
    setCommentInput("");
  };

  const submitComment = () => {
    if (!commentTarget) return;
    addComment(commentTarget.id, commentInput);
    setCommentInput("");
    Keyboard.dismiss();
  };

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

      {tab === "explore" ? (
        <FeedExploreTab
          data={explorePosts}
          onToggleLike={toggleLike}
          onToggleReshare={openReshare}
          onPressComment={openComments}
          onPressCard={openDetail}
          scrollHandler={scrollHandler}
        />
      ) : (
        <FeedFollowingTab
          data={followingPosts}
          onToggleLike={toggleLike}
          onToggleReshare={openReshare}
          onPressComment={openComments}
          onPressCard={openDetail}
          scrollHandler={scrollHandler}
        />
      )}

      <ReshareSheet
        visible={!!selectedPost}
        target={selectedPost}
        note={reshareNote}
        onChangeNote={setReshareNote}
        onClose={closeReshare}
        onSubmit={submitReshare}
      />

      <CommentsSheet
        visible={!!commentTarget}
        target={commentTarget}
        comments={commentTarget ? (commentsByPost[commentTarget.id] ?? []) : []}
        input={commentInput}
        onChangeInput={setCommentInput}
        onClose={closeComments}
        onSubmit={submitComment}
      />
    </View>
  );
}

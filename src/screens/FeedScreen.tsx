// Feed Screen
// src/screens/FeedScreen.tsx
import React from "react";
import { View, Pressable, Text } from "react-native";
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
  const [tabsVisible, setTabsVisible] = React.useState(true);
  const tabsAnim = useSharedValue(1); // 1 = hiện, 0 = ẩn
  const lastOffset = React.useRef(0);

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
  };

  const handleScroll = (y: number) => {
    const diff = y - lastOffset.current;
    if (diff > 8 && y > 24) {
      setTabsVisible(false);
    } else if (diff < -8) {
      setTabsVisible(true);
    }
    lastOffset.current = y;
  };

  React.useEffect(() => {
    tabsAnim.value = withTiming(tabsVisible ? 1 : 0, { duration: 180 });
  }, [tabsVisible, tabsAnim]);

  const tabAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(tabsAnim.value, [0, 1], [0, 52]),
    opacity: tabsAnim.value,
    transform: [
      {
        translateY: interpolate(tabsAnim.value, [0, 1], [-10, 0]),
      },
    ],
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
          onScrollY={handleScroll}
        />
      ) : (
        <FeedFollowingTab
          data={followingPosts}
          onToggleLike={toggleLike}
          onToggleReshare={openReshare}
          onPressComment={openComments}
          onPressCard={openDetail}
          onScrollY={handleScroll}
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
        comments={commentTarget ? commentsByPost[commentTarget.id] ?? [] : []}
        input={commentInput}
        onChangeInput={setCommentInput}
        onClose={closeComments}
        onSubmit={submitComment}
      />
    </View>
  );
}

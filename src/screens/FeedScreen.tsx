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
  const [selectedPost, setSelectedPost] = React.useState<FeedPost | undefined>();
  const [reshareNote, setReshareNote] = React.useState("");
  const [commentTarget, setCommentTarget] = React.useState<
    FeedPost | undefined
  >();
  const [commentInput, setCommentInput] = React.useState("");

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

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: Math.max(insets.top, 12) }}
    >
      <View className="px-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1">
          <Text className="text-xl font-bold text-slate-900 uppercase">
            {FEED_STRINGS.HEADER_TITLE}
          </Text>
          <Ionicons name="star-outline" size={18} color="#16A34A" />
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable hitSlop={8}>
            <Ionicons name="search-outline" size={22} color="#0F172A" />
          </Pressable>
          <Pressable hitSlop={8}>
            <Ionicons name="notifications-outline" size={22} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      <FeedTabs tab={tab} onChange={setTab} />

      {tab === "explore" ? (
        <FeedExploreTab
          data={explorePosts}
          onToggleLike={toggleLike}
          onToggleReshare={openReshare}
          onPressComment={openComments}
          onPressCard={openDetail}
        />
      ) : (
        <FeedFollowingTab
          data={followingPosts}
          onToggleLike={toggleLike}
          onToggleReshare={openReshare}
          onPressComment={openComments}
          onPressCard={openDetail}
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

import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useColorScheme,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FeedPostCard from "../domains/feed/components/cards/FeedPostCard";
import { FeedStackParamList } from "../app/navigation/Stack/FeedStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { FEED_STRINGS, CURRENT_USER } from "../domains/feed/constants";
import { FeedPost } from "../domains/feed/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import ReshareSheet from "../domains/feed/components/sheets/ReshareSheet";
import ImageViewing from "react-native-image-viewing";
import { usePostComments } from "../domains/feed/hooks/usePostComments";
import { addCommentToPost, togglePostLike, createPost } from "../domains/feed/services/feedService";
import { useAuth } from "../domains/auth/contexts/AuthContext";
import { useProfileContext } from "@/domains/user/contexts/ProfileContext";
import { usePostLike } from "../domains/feed/hooks/usePostLike";
import { usePostMetrics } from "../domains/feed/hooks/usePostMetrics";

type RouteProps = { key: string; name: "FeedDetail"; params: { post: FeedPost } };

export default function FeedDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { currentUser } = useAuth();
  const { profile } = useProfileContext();
  const originalPost = route.params?.post;

  const [input, setInput] = useState("");
  const [showReshare, setShowReshare] = useState(false);
  const { comments, loading } = usePostComments(originalPost?.id);
  const { isLiked, toggleOptimistic } = usePostLike(originalPost?.id, originalPost?.liked);
  const metrics = usePostMetrics(originalPost?.id, originalPost?.metrics);

  // Create post with real-time data
  const postWithRealTimeData = useMemo(() => {
    if (!originalPost) return originalPost;
    return {
      ...originalPost,
      liked: isLiked,
      metrics: metrics,
    };
  }, [originalPost, isLiked, metrics]);

  const authorSnapshot = useMemo(() => {
    if (!currentUser) return null;
    const rawHandle =
      profile.user.handle ||
      (currentUser.email ? currentUser.email.split("@")[0] : "user");
    const handle = rawHandle.startsWith("@") ? rawHandle.slice(1) : rawHandle;
    const name =
      profile.user.name ||
      currentUser.displayName ||
      currentUser.email ||
      "User";
    const avatar = profile.user.avatarUri || currentUser.photoURL || undefined;
    return {
      id: currentUser.uid,
      name,
      handle,
      avatar,
    };
  }, [
    currentUser,
    profile.user.avatarUri,
    profile.user.handle,
    profile.user.name,
  ]);

  // Image viewer state
  const viewerKeyRef = useRef(0);
  const [viewerState, setViewerState] = useState<{
    visible: boolean;
    images: { uri: string }[];
    initialIndex: number;
    key: string;
  }>({
    visible: false,
    images: [],
    initialIndex: 0,
    key: "viewer-0",
  });

  const toggleLike = async () => {
    if (!currentUser || !originalPost) return;

    try {
      toggleOptimistic();
      await togglePostLike(originalPost.id, currentUser.uid, isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const openReshare = () => {
    setShowReshare(true);
  };

  const submitReshare = async (note: string) => {
    if (!currentUser || !authorSnapshot || !originalPost) return;

    try {
      const quote = {
        id: originalPost.id,
        authorId: originalPost.author.id,
        authorName: originalPost.author.name,
        handle: originalPost.author.handle,
        avatar: originalPost.author.avatar,
        content: originalPost.content,
        createdAt: originalPost.createdAt,
        media: originalPost.media,
      };

      await createPost({
        authorId: currentUser.uid,
        authorSnapshot,
        content: note,
        media: null,
        quote: quote,
        isReshare: true,
        resharedFrom: originalPost.author,
      } as any);

      setShowReshare(false);
    } catch (error) {
      console.error("Failed to reshare:", error);
    }
  };

  const addComment = async () => {
    const trimmed = input.trim();
    if (!trimmed || !originalPost?.id) return;
    if (!currentUser || !authorSnapshot) {
      console.warn("User not logged in; cannot add comment.");
      return;
    }

    try {
      await addCommentToPost(originalPost.id, {
        authorSnapshot,
        content: trimmed,
      });
      setInput("");
      Keyboard.dismiss();
    } catch (error) {
      console.error("Failed to add comment from detail:", error);
    }
  };

  const handleOpenViewer = (images: { uri: string }[], index: number) => {
    viewerKeyRef.current += 1;
    const key = `viewer-${viewerKeyRef.current}-${images.length}-${index}`;
    setViewerState({ visible: false, images, initialIndex: index, key });
    requestAnimationFrame(() => {
      setViewerState((prev) => ({ ...prev, visible: true }));
    });
  };

  const handleCloseViewer = () => {
    setViewerState((prev) => ({ ...prev, visible: false }));
  };

  // Hide tab bar while on detail
  useFocusEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: "none" } });
    return () => {
      parent?.setOptions({ tabBarStyle: undefined });
    };
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View
        className="flex-row items-center px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <FeedPostCard
          post={postWithRealTimeData}
          onPressLike={() => toggleLike()}
          onPressReshare={() => openReshare()}
          onPressComment={() => { }}
          onPressImage={handleOpenViewer}
          disableRealtime={false}
        />

        <View className="mt-6 px-2">
          {loading ? (
            <Text className="text-center text-slate-500">
              Loading comments...
            </Text>
          ) : comments.length === 0 ? (
            <Text className="text-center text-slate-500">
              {FEED_STRINGS.COMMENTS_EMPTY}
            </Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} className="py-3 border-b border-slate-100">
                <Text className="text-sm font-semibold text-slate-900">
                  {c.author.name} @{c.author.handle}
                </Text>
                <Text className="text-[11px] text-slate-400">
                  {c.relativeTime ?? ""}
                </Text>
                <Text className="text-sm text-slate-800 mt-1 leading-5">
                  {c.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View
        className="bg-white"
        style={{
          paddingHorizontal: 12,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        }}
      >
        <View className="flex-row items-center rounded-full border border-slate-200 px-3 py-2 bg-white shadow-sm">
          {CURRENT_USER.avatar ? (
            <View className="h-8 w-8 rounded-full overflow-hidden mr-2 bg-slate-200" />
          ) : (
            <View className="h-8 w-8 rounded-full bg-emerald-500 items-center justify-center mr-2">
              <Text className="text-white font-semibold">You</Text>
            </View>
          )}
          <TextInput
            className="flex-1 text-slate-900"
            style={{ paddingVertical: 0, textAlignVertical: "center" }}
            placeholder={FEED_STRINGS.COMMENTS_PLACEHOLDER}
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            multiline
            keyboardAppearance={colorScheme === "dark" ? "dark" : "light"}
          />
          <Pressable onPress={addComment} hitSlop={8}>
            <Text className="text-base font-semibold text-[#0B73FF]">
              {FEED_STRINGS.COMMENTS_POST}
            </Text>
          </Pressable>
        </View>
      </View>
      <ReshareSheet
        visible={showReshare}
        target={originalPost}
        onClose={() => setShowReshare(false)}
        onSubmit={submitReshare}
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
    </KeyboardAvoidingView>
  );
}

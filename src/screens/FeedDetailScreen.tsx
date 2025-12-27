import React, { useState, useRef } from "react";
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
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FeedPostCard from "../domains/feed/components/cards/FeedPostCard";
import { FEED_STRINGS, CURRENT_USER } from "../domains/feed/constants";
import { FeedPost } from "../domains/feed/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import ReshareSheet from "../domains/feed/components/sheets/ReshareSheet";
import ImageViewing from "react-native-image-viewing";
import { usePostComments } from "../domains/feed/hooks/usePostComments";
import { addCommentToPost, togglePostLike } from "../domains/feed/services/feedService";
import { useAuth } from "../domains/auth/contexts/AuthContext";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { firestore } from "@/configs/firebase";

type RouteProps = RouteProp<Record<string, { post: FeedPost }>, string>;

export default function FeedDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { currentUser } = useAuth();
  const originalPost = route.params?.post;

  const [post, setPost] = useState<FeedPost>(originalPost);
  const [input, setInput] = useState("");
  const [showReshare, setShowReshare] = useState(false);
  const { comments, loading } = usePostComments(post?.id);
  const currentUserId = currentUser?.uid;

  // Keep post metrics/content in sync with Firestore (cross-screen consistency)
  useEffect(() => {
    if (!originalPost?.id) return;
    const ref = doc(firestore, "posts", originalPost.id);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      setPost((prev) => ({
        id: snap.id,
        author: data.authorSnapshot ?? prev?.author ?? originalPost.author,
        content: data.content ?? prev?.content ?? "",
        createdAt:
          (data.createdAt as Timestamp | undefined)?.toMillis?.() ??
          prev?.createdAt ??
          Date.now(),
        relativeTime: prev?.relativeTime ?? originalPost.relativeTime,
        media: data.media ?? prev?.media,
        metrics: data.metrics ?? prev?.metrics ?? originalPost.metrics,
        liked: prev?.liked ?? originalPost.liked,
        quote: data.quote ?? prev?.quote,
        reshared: data.reshared ?? prev?.reshared,
        resharedFrom: data.resharedFrom ?? prev?.resharedFrom,
        isReshare: data.isReshare ?? prev?.isReshare,
      }));
    });
    return () => unsubscribe();
  }, [originalPost?.id, originalPost?.author, originalPost?.metrics, originalPost?.relativeTime]);

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

  const toggleLike = () => {
    if (!post?.id || !currentUserId) return;
    setPost((prev) => ({
      ...prev,
      liked: !prev.liked,
      metrics: {
        ...prev.metrics,
        likes: Math.max(0, prev.metrics.likes + (prev.liked ? -1 : 1)),
      },
    }));
    togglePostLike(post.id, currentUserId, post.liked).catch((err) => {
      console.error("Failed to toggle like from detail:", err);
    });
  };

  const openReshare = () => {
    setShowReshare(true);
  };

  const submitReshare = (_note: string) => {
    setPost((prev) => ({
      ...prev,
      reshared: true,
      metrics: {
        ...prev.metrics,
        shares: prev.metrics.shares + 1,
      },
    }));
    setShowReshare(false);
  };

  const addComment = async () => {
    const trimmed = input.trim();
    if (!trimmed || !post?.id) return;
    if (!currentUser) {
      console.warn("User not logged in; cannot add comment.");
      return;
    }

    const authorSnapshot = {
      id: currentUser.uid,
      name: currentUser.displayName || "User",
      handle: (currentUser.email || "user").split("@")[0],
      avatar: currentUser.photoURL || undefined,
    };

    try {
      await addCommentToPost(post.id, {
        authorSnapshot,
        content: trimmed,
      });
      setPost((prev) => ({
        ...prev,
        metrics: { ...prev.metrics, comments: prev.metrics.comments + 1 },
      }));
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
          post={post}
          onPressLike={() => toggleLike()}
          onPressReshare={() => openReshare()}
          onPressComment={() => { }}
          onPressImage={handleOpenViewer}
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
        target={post}
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

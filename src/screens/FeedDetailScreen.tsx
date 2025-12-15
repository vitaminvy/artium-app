import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
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

type RouteProps = { key: string; name: "FeedDetail"; params: { post: FeedPost } };

export default function FeedDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation =
    useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const insets = useSafeAreaInsets();
  const originalPost = route.params?.post;

  const [post, setPost] = useState<FeedPost>(originalPost);
  const [input, setInput] = useState("");
  const [comments, setComments] = useState<
    { id: string; author: { name: string; handle: string }; content: string }[]
  >([]);

  const toggleLike = () => {
    setPost((prev) => ({
      ...prev,
      liked: !prev.liked,
      metrics: {
        ...prev.metrics,
        likes: prev.metrics.likes + (prev.liked ? -1 : 1),
      },
    }));
  };

  const toggleReshare = () => {
    setPost((prev) => ({
      ...prev,
      reshared: !prev.reshared,
      metrics: {
        ...prev.metrics,
        shares: prev.metrics.shares + (prev.reshared ? -1 : 1),
      },
    }));
  };

  const addComment = () => {
    if (!input.trim()) return;
    const newComment = {
      id: `detail-cmt-${Date.now()}`,
      author: { name: CURRENT_USER.name, handle: CURRENT_USER.handle },
      content: input.trim(),
    };
    setComments((prev) => [newComment, ...prev]);
    setPost((prev) => ({
      ...prev,
      metrics: { ...prev.metrics, comments: prev.metrics.comments + 1 },
    }));
    setInput("");
    Keyboard.dismiss();
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
          onPressReshare={() => toggleReshare()}
          onPressComment={() => {}}
        />

        <View className="mt-6 px-2">
          {comments.length === 0 ? (
            <Text className="text-center text-slate-500">
              {FEED_STRINGS.COMMENTS_EMPTY}
            </Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} className="py-3 border-b border-slate-100">
                <Text className="text-sm font-semibold text-slate-900">
                  {c.author.name} @{c.author.handle}
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
            className="flex-1 text-base text-slate-900"
            placeholder={FEED_STRINGS.COMMENTS_PLACEHOLDER}
            placeholderTextColor="#94A3B8"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <Pressable onPress={addComment} hitSlop={8}>
            <Text className="text-base font-semibold text-[#0B73FF]">
              {FEED_STRINGS.COMMENTS_POST}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

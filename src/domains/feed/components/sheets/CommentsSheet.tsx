import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  TextInput,
  Animated,
  Easing,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FeedComment, FeedPost } from "../../types";
import { CURRENT_USER, FEED_STRINGS } from "../../constants";

type Props = {
  visible: boolean;
  target?: FeedPost;
  comments: FeedComment[];
  input: string;
  onChangeInput: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CommentsSheet({
  visible,
  target,
  comments,
  input,
  onChangeInput,
  onClose,
  onSubmit,
}: Props) {
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(1);
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slide.setValue(1);
    }
  }, [visible, slide]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  const renderItem = ({ item }: ListRenderItemInfo<FeedComment>) => (
    <View className="flex-row gap-3 px-4 py-3">
      <View className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden items-center justify-center">
        {item.author.avatar ? (
          <Animated.Image
            source={{ uri: item.author.avatar }}
            className="h-full w-full"
          />
        ) : (
          <Text className="text-xs font-semibold text-slate-700">
            {item.author.name[0]}
          </Text>
        )}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-slate-900">
            {item.author.name}
          </Text>
          <Text className="text-[11px] text-slate-500">@{item.author.handle}</Text>
          <Text className="text-[11px] text-slate-400">· {item.relativeTime}</Text>
        </View>
        <Text className="text-sm text-slate-800 mt-1 leading-5">
          {item.content}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/45 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          className="bg-white rounded-t-[28px] pt-3 pb-6"
          style={{
            transform: [{ translateY }],
          }}
        >
          <View className="px-4 pb-3 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">
              {FEED_STRINGS.COMMENTS_TITLE}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>

          {comments.length === 0 ? (
            <View className="px-4 py-3">
              <Text className="text-sm text-slate-600">
                {FEED_STRINGS.COMMENTS_EMPTY}
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View className="px-4 pt-4">
            <View className="flex-row items-center rounded-full border border-slate-200 px-3 py-2 bg-white">
              {CURRENT_USER.avatar ? (
                <View className="h-8 w-8 rounded-full overflow-hidden mr-2">
                  <Animated.Image
                    source={{ uri: CURRENT_USER.avatar }}
                    className="h-full w-full"
                  />
                </View>
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
                onChangeText={onChangeInput}
                multiline
              />
              <Pressable onPress={onSubmit} hitSlop={8}>
                <Text className="text-base font-semibold text-[#0B73FF]">
                  {FEED_STRINGS.COMMENTS_POST}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

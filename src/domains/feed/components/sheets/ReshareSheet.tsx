import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Pressable,
  Text,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FeedPost } from "../../types";
import { CURRENT_USER, FEED_STRINGS } from "../../constants";

type Props = {
  visible: boolean;
  target?: FeedPost;
  note: string;
  onChangeNote: (text: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function ReshareSheet({
  visible,
  target,
  note,
  onChangeNote,
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          className="bg-white rounded-t-[28px] px-5 pt-4 pb-6"
          style={{
            transform: [{ translateY }],
          }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center gap-2">
              {CURRENT_USER.avatar ? (
                <View className="h-10 w-10 rounded-full overflow-hidden">
                  <Animated.Image
                    source={{ uri: CURRENT_USER.avatar }}
                    className="h-full w-full"
                  />
                </View>
              ) : (
                <View className="h-10 w-10 rounded-full bg-emerald-500 items-center justify-center">
                  <Text className="text-white font-bold">YOU</Text>
                </View>
              )}
              <View>
                <Text className="text-sm font-semibold text-slate-900">
                  {CURRENT_USER.name}
                </Text>
                <Text className="text-xs text-slate-500">
                  @{CURRENT_USER.handle}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>

          <TextInput
            placeholder={FEED_STRINGS.RESHARE_TITLE}
            value={note}
            onChangeText={onChangeNote}
            className="text-base text-slate-900 mb-4"
            placeholderTextColor="#94A3B8"
            multiline
          />

          {target ? (
            <View className="border border-slate-200 rounded-2xl p-3 mb-4">
              <View className="flex-row items-center gap-2 mb-2">
                <View className="h-8 w-8 rounded-full bg-slate-200" />
                <View>
                  <Text className="text-sm font-semibold text-slate-900">
                    {target.author.name}
                  </Text>
                  <Text className="text-xs text-slate-500">
                    @{target.author.handle} · {target.relativeTime ?? "1m"}
                  </Text>
                </View>
              </View>
              <Text className="text-[13px] text-slate-800 mb-2">
                {target.content}
              </Text>
              {target.media ? (
                <View
                  className="rounded-xl overflow-hidden"
                  style={{
                    backgroundColor: target.media.placeholderColor ?? "#CBD5E1",
                    aspectRatio: target.media.aspectRatio ?? 1,
                  }}
                />
              ) : null}
            </View>
          ) : null}

          <Text className="text-[12px] text-slate-500 mb-4">
            {FEED_STRINGS.RESHARE_NOTE}
          </Text>

          <Pressable
            onPress={onSubmit}
            className="rounded-full bg-[#0B73FF] py-4 items-center active:opacity-90"
          >
            <Text className="text-base font-semibold text-white">
              {FEED_STRINGS.RESHARE_BUTTON}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

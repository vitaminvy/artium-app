import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { CURRENT_USER } from "../constants";
import { FeedPost, PostMomentMedia } from "../types";
import { subscribePostMomentOpen } from "../../../shared/utils/postMomentBridge";

const normalizeDurationMs = (duration?: number) => {
  if (!duration) return undefined;
  if (duration > 1000) return duration;
  return duration * 1000;
};

export function usePostMoment({
  onPublish,
}: UsePostMomentParams): UsePostMomentResult {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<PostMomentMedia | undefined>();

  const resetDraft = useCallback(() => {
    setText("");
    setMedia(undefined);
  }, []);

  const open = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetDraft();
    setVisible(false);
  }, [resetDraft]);

  useEffect(() => subscribePostMomentOpen(open), [open]);

  const handlePickMedia = useCallback(async (type: "image" | "video") => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const mediaTypes =
      type === "image"
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: false,
      quality: 0.92,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) return;
    const asset = pickerResult.assets[0];
    const durationMs =
      typeof asset.duration === "number"
        ? normalizeDurationMs(asset.duration)
        : undefined;

    setMedia({
      type,
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      durationMs,
    });
  }, []);

  const pickImage = useCallback(
    () => handlePickMedia("image"),
    [handlePickMedia]
  );
  const pickVideo = useCallback(
    () => handlePickMedia("video"),
    [handlePickMedia]
  );

  const removeMedia = useCallback(() => {
    Haptics.selectionAsync();
    setMedia(undefined);
  }, []);

  const canShare = useMemo(
    () => text.trim().length > 0 || !!media,
    [media, text]
  );

  const share = useCallback(() => {
    if (!canShare) return;

    const now = Date.now();
    const feedMedia = media
      ? {
          url: media.uri,
          placeholderColor: "#E2E8F0",
          type: media.type,
          durationMs: media.durationMs,
        }
      : undefined;

    const newPost: FeedPost = {
      id: `moment-${now}`,
      author: CURRENT_USER,
      content: text.trim(),
      createdAt: now,
      relativeTime: "Just now",
      media: feedMedia,
      metrics: { likes: 0, comments: 0, shares: 0 },
      liked: false,
      reshared: false,
    };

    onPublish(newPost);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetDraft();
    setVisible(false);
  }, [canShare, media, onPublish, resetDraft, text]);

  const state: UsePostMomentState = {
    visible,
    text,
    media,
    canShare,
  };

  const actions: UsePostMomentActions = useMemo(
    () => ({
      open,
      close,
      setText,
      pickImage,
      pickVideo,
      removeMedia,
      share,
    }),
    [close, open, pickImage, pickVideo, removeMedia, share]
  );

  return { state, actions };
}
type UsePostMomentParams = {
  onPublish: (post: FeedPost) => void;
};

type UsePostMomentState = {
  visible: boolean;
  text: string;
  media?: PostMomentMedia;
  canShare: boolean;
};

type UsePostMomentActions = {
  open: () => void;
  close: () => void;
  setText: (value: string) => void;
  pickImage: () => Promise<void>;
  pickVideo: () => Promise<void>;
  removeMedia: () => void;
  share: () => void;
};

export type UsePostMomentResult = {
  state: UsePostMomentState;
  actions: UsePostMomentActions;
};

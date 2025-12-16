import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
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

    if (type === "image") {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.92,
      });

      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const items = pickerResult.assets.map((asset) => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      }));
      // Ensure video state is cleared when selecting images
      setMedia({ type: "image", items });
      return;
    }

    // Video flow: single selection, ensure images cleared
    setMedia(undefined);
    const cacheFile = `${FileSystem.cacheDirectory ?? ""}moment-video-${Date.now()}.mp4`;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: false,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
      quality: 0.92,
    });
    if (pickerResult.canceled || !pickerResult.assets?.length) return;
    const asset = pickerResult.assets[0];

    // Determine source URI; iCloud assets may not be local
    let sourceUri = asset.uri;
    const hasLocalFile = sourceUri?.startsWith("file://");

    if (!hasLocalFile && sourceUri) {
      const downloadRes = await FileSystem.createDownloadResumable(
        sourceUri,
        cacheFile,
        {},
        (progress) => {
          const pct = progress.totalBytesExpectedToWrite
            ? progress.totalBytesWritten / progress.totalBytesExpectedToWrite
            : 0;
        }
      ).downloadAsync();

      if (downloadRes?.uri) {
        sourceUri = downloadRes.uri;
      }
    }

    if (!sourceUri) return;

    const aspectRatio =
      asset.width && asset.height ? asset.width / asset.height : undefined;

    setMedia({
      type: "video",
      uri: sourceUri,
      width: asset.width,
      height: asset.height,
      durationMs: undefined, // will be resolved after load
      aspectRatio,
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

  const removeImageAt = useCallback((index: number) => {
    setMedia((prev) => {
      if (!prev || prev.type !== "image") return prev;
      const nextItems = [...prev.items];
      nextItems.splice(index, 1);
      if (!nextItems.length) return undefined;
      return { ...prev, items: nextItems };
    });
  }, []);

  const canShare = useMemo(
    () =>
      text.trim().length > 0 ||
      (media?.type === "image" ? media.items.length > 0 : !!media),
    [media, text]
  );

  const share = useCallback(() => {
    if (!canShare) return;

    const now = Date.now();
    let feedMedia: FeedPost["media"] | undefined;
    if (media?.type === "image") {
      feedMedia = {
        type: "image",
        items: media.items.map((item) => ({
          uri: item.uri,
          width: item.width,
          height: item.height,
        })),
        placeholderColor: "#E2E8F0",
      };
    } else if (media?.type === "video") {
      feedMedia = {
        type: "video",
        uri: media.uri,
        durationMs: media.durationMs,
        placeholderColor: "#E2E8F0",
        aspectRatio: media.aspectRatio,
      };
    }

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
      removeImageAt,
      setVideoDuration: (durationMs?: number) => {
        setMedia((prev) => {
          if (!prev || prev.type !== "video") return prev;
          if (durationMs && durationMs > 60_000) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            alert("Video must be 60 seconds or less");
            return undefined;
          }
          return { ...prev, durationMs: durationMs ?? prev.durationMs };
        });
      },
      share,
    }),
    [
      close,
      open,
      pickImage,
      pickVideo,
      removeImageAt,
      removeMedia,
      share,
    ]
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
  removeImageAt: (index: number) => void;
  setVideoDuration: (durationMs?: number) => void;
  share: () => void;
};

export type UsePostMomentResult = {
  state: UsePostMomentState;
  actions: UsePostMomentActions;
};

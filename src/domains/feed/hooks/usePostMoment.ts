import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { CURRENT_USER } from "../constants";
import { FeedPost, PostMomentMedia } from "../types";
import { subscribePostMomentOpen } from "../../../shared/utils/postMomentBridge";
import { MEDIA_CONFIG } from "../constants/media";
import { FEED_MESSAGES } from "../constants/messages";

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
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          FEED_MESSAGES.ERROR_PERMISSION_DENIED,
          FEED_MESSAGES.ERROR_PERMISSION_MESSAGE
        );
        return;
      }

      if (type === "image") {
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: MEDIA_CONFIG.IMAGE_QUALITY,
        });

        if (pickerResult.canceled || !pickerResult.assets?.length) return;
        const items = pickerResult.assets.map((asset: any) => ({
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
      const cacheDir = (FileSystem as any).cacheDirectory ?? "";
      const cacheFile = `${cacheDir}${MEDIA_CONFIG.CACHE_FILE_PREFIX}${Date.now()}.mp4`;

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: false,
        videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
        videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
        quality: MEDIA_CONFIG.VIDEO_QUALITY,
      });
      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const asset = pickerResult.assets[0];

      // Validate asset has URI
      if (!asset.uri) {
        Alert.alert(
          FEED_MESSAGES.ERROR_VIDEO_UNAVAILABLE,
          FEED_MESSAGES.ERROR_VIDEO_UNAVAILABLE_MESSAGE
        );
        return;
      }

      // Determine source URI; iCloud assets may not be local
      let sourceUri = asset.uri;
      const hasLocalFile = sourceUri?.startsWith("file://");

      if (!hasLocalFile && sourceUri) {
        // Check if file exists before downloading
        try {
          const fileInfo = await FileSystem.getInfoAsync(sourceUri);
          if (!fileInfo.exists) {
            Alert.alert(
              FEED_MESSAGES.ERROR_VIDEO_ICLOUD,
              FEED_MESSAGES.ERROR_VIDEO_ICLOUD_MESSAGE
            );
            return;
          }
        } catch (error) {
          console.warn("File check failed, attempting download:", error);
        }

        const downloadRes = await FileSystem.createDownloadResumable(
          sourceUri,
          cacheFile,
          {}
        ).downloadAsync();

        if (downloadRes?.uri) {
          sourceUri = downloadRes.uri;
        }
      }

      if (!sourceUri) {
        Alert.alert("Error", FEED_MESSAGES.ERROR_VIDEO_LOAD_FAILED);
        return;
      }

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
    } catch (error) {
      console.error("Failed to pick media:", error);
      Alert.alert("Error", FEED_MESSAGES.ERROR_MEDIA_SELECTION_FAILED);
    }
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
        placeholderColor: MEDIA_CONFIG.PLACEHOLDER_COLOR,
      };
    } else if (media?.type === "video") {
      feedMedia = {
        type: "video",
        uri: media.uri,
        durationMs: media.durationMs,
        placeholderColor: MEDIA_CONFIG.PLACEHOLDER_COLOR,
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
          if (durationMs && durationMs > MEDIA_CONFIG.MAX_VIDEO_DURATION_MS) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", FEED_MESSAGES.ERROR_VIDEO_TOO_LONG);
            return undefined;
          }
          return { ...prev, durationMs: durationMs ?? prev.durationMs };
        });
      },
      share,
    }),
    [close, open, pickImage, pickVideo, removeImageAt, removeMedia, share]
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

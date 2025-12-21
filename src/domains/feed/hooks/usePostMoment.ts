import { useCallback, useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import { CURRENT_USER } from "../constants";
import { FeedPost, PostMomentMedia } from "../types";
import { subscribePostMomentOpen } from "../../../shared/utils/postMomentBridge";
import { MEDIA_CONFIG } from "../constants/media";
import { FEED_MESSAGES } from "../constants/messages";
import { uploadMedia } from "../../../shared/services/uploadService";

type MediaSource = "library" | "camera";

export function usePostMoment({
  onPublish,
  onShared,
}: UsePostMomentParams): UsePostMomentResult {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<PostMomentMedia | undefined>();
  const [isUploading, setIsUploading] = useState(false); // ADD UPLOADING STATE

  const resetDraft = useCallback(() => {
    setText("");
    setMedia(undefined);
  }, []);

  const open = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    // Prevent closing while uploading
    if (isUploading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetDraft();
    setVisible(false);
  }, [resetDraft, isUploading]);

  useEffect(() => subscribePostMomentOpen(open), [open]);

  // ... (The image/video picker logic remains the same)
  const chooseSource = useCallback(
    async (type: "image" | "video"): Promise<MediaSource | null> => {
      const cameraLabel =
        type === "image"
          ? FEED_MESSAGES.ACTION_CAMERA_PHOTO
          : FEED_MESSAGES.ACTION_CAMERA_VIDEO;
      const libraryLabel = FEED_MESSAGES.ACTION_LIBRARY;

      if (Platform.OS === "ios") {
        return new Promise((resolve) => {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              options: [cameraLabel, libraryLabel, FEED_MESSAGES.ACTION_CANCEL],
              cancelButtonIndex: 2,
            },
            (buttonIndex) => {
              if (buttonIndex === 0) return resolve("camera");
              if (buttonIndex === 1) return resolve("library");
              resolve(null);
            }
          );
        });
      }

      return new Promise((resolve) => {
        Alert.alert(FEED_MESSAGES.SOURCE_PICKER_TITLE, "", [
          {
            text: cameraLabel,
            onPress: () => resolve("camera"),
          },
          {
            text: libraryLabel,
            onPress: () => resolve("library"),
          },
          {
            text: FEED_MESSAGES.ACTION_CANCEL,
            style: "cancel",
            onPress: () => resolve(null),
          },
        ]);
      });
    },
    []
  );

  const ensurePermission = useCallback(async (source: MediaSource) => {
    if (source === "library") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          FEED_MESSAGES.ERROR_PERMISSION_DENIED,
          FEED_MESSAGES.ERROR_PERMISSION_MESSAGE
        );
        return false;
      }
      return true;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        FEED_MESSAGES.ERROR_PERMISSION_DENIED,
        FEED_MESSAGES.ERROR_CAMERA_PERMISSION_MESSAGE
      );
      return false;
    }
    return true;
  }, []);

  const handlePickMedia = useCallback(async (type: "image" | "video", source: MediaSource = "library") => {
    try {
      const hasPermission = await ensurePermission(source);
      if (!hasPermission) return;

      if (type === "image") {
        const pickerResult =
          source === "camera"
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: MEDIA_CONFIG.IMAGE_QUALITY,
              })
            : await ImagePicker.launchImageLibraryAsync({
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
        setMedia({ type: "image", items });
        return;
      }

      // Video flow: single selection, ensure images cleared
      setMedia(undefined);
      const cacheDir = (FileSystem as any).cacheDirectory ?? "";
      const cacheFile = `${cacheDir}${MEDIA_CONFIG.CACHE_FILE_PREFIX}${Date.now()}.mp4`;

      const pickerResult =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              videoMaxDuration: MEDIA_CONFIG.MAX_VIDEO_DURATION_MS / 1000,
              videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
              videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
              quality: MEDIA_CONFIG.VIDEO_QUALITY,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Videos,
              allowsMultipleSelection: false,
              videoQuality: ImagePicker.UIImagePickerControllerQualityType.High,
              videoExportPreset: ImagePicker.VideoExportPreset.MediumQuality,
              quality: MEDIA_CONFIG.VIDEO_QUALITY,
            });
      if (pickerResult.canceled || !pickerResult.assets?.length) return;
      const asset = pickerResult.assets[0];

      const rawDuration = asset.duration ?? 0;
      const durationMs =
        rawDuration > 0 && rawDuration < 1000 ? rawDuration * 1000 : rawDuration;

      if (durationMs && durationMs > MEDIA_CONFIG.MAX_VIDEO_DURATION_MS) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", FEED_MESSAGES.ERROR_VIDEO_TOO_LONG);
        return;
      }

      if (!asset.uri) {
        Alert.alert(
          FEED_MESSAGES.ERROR_VIDEO_UNAVAILABLE,
          FEED_MESSAGES.ERROR_VIDEO_UNAVAILABLE_MESSAGE
        );
        return;
      }

      let sourceUri = asset.uri;

      if (source === "library") {
        const hasLocalFile = sourceUri?.startsWith("file://");

        if (!hasLocalFile && sourceUri) {
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
        durationMs: durationMs || undefined,
        aspectRatio,
      });
    } catch (error) {
      console.error("Failed to pick media:", error);
      Alert.alert("Error", FEED_MESSAGES.ERROR_MEDIA_SELECTION_FAILED);
    }
  }, [ensurePermission, chooseSource]);


  const pickImage = useCallback(async () => {
    const source = await chooseSource("image");
    if (!source) return;
    return handlePickMedia("image", source);
  }, [chooseSource, handlePickMedia]);

  const pickVideo = useCallback(async () => {
    const source = await chooseSource("video");
    if (!source) return;
    return handlePickMedia("video", source);
  }, [chooseSource, handlePickMedia]);

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
      !isUploading && (text.trim().length > 0 ||
      (media?.type === "image" ? media.items.length > 0 : !!media)),
    [media, text, isUploading]
  );

 // --- REFACTORED SHARE FUNCTION ---
  const share = useCallback(async () => {
    if (!canShare) return;

    setIsUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      let feedMedia: FeedPost["media"] | undefined;

      // Step 1: Upload media if it exists and get download URLs
      if (media?.type === "image") {
        const uploadPromises = media.items.map(item => uploadMedia(item.uri, 'posts'));
        const downloadUrls = await Promise.all(uploadPromises);
        feedMedia = {
          type: "image",
          items: downloadUrls.map((url, index) => ({ // Using original width/height
            uri: url,
            width: media.items[index].width,
            height: media.items[index].height,
          })),
          placeholderColor: MEDIA_CONFIG.PLACEHOLDER_COLOR,
        };
      } else if (media?.type === "video") {
        const downloadUrl = await uploadMedia(media.uri, 'posts');
        feedMedia = {
          type: "video",
          uri: downloadUrl,
          durationMs: media.durationMs,
          placeholderColor: MEDIA_CONFIG.PLACEHOLDER_COLOR,
          aspectRatio: media.aspectRatio,
        };
      }

      // Step 2: Create the post object with the public media URLs
      const newPost: FeedPost = {
        id: `moment-${Date.now()}`, // This ID is temporary, Firestore will generate the real one
        author: CURRENT_USER, // This is also temporary, the backend will use the authenticated user
        content: text.trim(),
        createdAt: Date.now(),
        relativeTime: "Just now",
        media: feedMedia, // Use the media object with public URLs
        metrics: { likes: 0, comments: 0, shares: 0 },
        liked: false,
        reshared: false,
      };

      // Step 3: Call onPublish to save the post to the backend
      await onPublish(newPost);
      
      // Step 4: Cleanup
      resetDraft();
      setVisible(false);
      onShared?.();

    } catch (error: any) {
      console.error("--- FAILED TO SHARE POST ---");
      // Log the full detailed error object from Firebase
      console.error("Full Error:", JSON.stringify(error, null, 2));
      if (error.serverResponse) {
        console.error("Server Response:", error.serverResponse);
      }
      console.error("-----------------------------");
      Alert.alert("Error", "Could not share your post. Please check the console for more details.");
    } finally {
      setIsUploading(false);
    }
  }, [canShare, media, onPublish, onShared, resetDraft, text]);

  const state: UsePostMomentState = {
    visible,
    text,
    media,
    canShare,
    isUploading, // Expose uploading state
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
  onPublish: (post: FeedPost) => Promise<void>; // Make onPublish async
  onShared?: () => void;
};

type UsePostMomentState = {
  visible: boolean;
  text: string;
  media?: PostMomentMedia;
  canShare: boolean;
  isUploading: boolean; // Expose uploading state
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

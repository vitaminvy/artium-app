/**
 * User-facing messages and strings for feed domain
 * Note: These should eventually be moved to i18n/localization system
 */

export const FEED_MESSAGES = {
  // Post moment
  MOMENT_TITLE: "Post a Moment",
  MOMENT_PLACEHOLDER: "Share a thought or ask a question...",
  SHARE_BUTTON: "Share to feed",

  // Media
  MEDIA_BUTTON_IMAGE: "Images",
  MEDIA_BUTTON_VIDEO: "Video",
  REMOVE_ALL_BUTTON: "Remove all",

  // Errors
  ERROR_PERMISSION_DENIED: "Permission Required",
  ERROR_PERMISSION_MESSAGE: "Please grant access to your photos to continue.",
  ERROR_VIDEO_TOO_LONG: "Video must be 60 seconds or less",
  ERROR_MEDIA_SELECTION_FAILED: "Failed to select media. Please try again.",
  ERROR_VIDEO_UNAVAILABLE: "Video Unavailable",
  ERROR_VIDEO_UNAVAILABLE_MESSAGE: "Unable to access this video. Please try another one.",
  ERROR_VIDEO_ICLOUD: "Video Not Available",
  ERROR_VIDEO_ICLOUD_MESSAGE: "This video is stored in iCloud and needs to be downloaded first. Please ensure it's downloaded to your device.",
  ERROR_VIDEO_LOAD_FAILED: "Failed to load video. Please try again.",

  // Video
  VIDEO_LABEL_FALLBACK: "Video",
} as const;

/**
 * Media-related constants for feed domain
 */

export const MEDIA_CONFIG = {
  // Image picker configuration
  IMAGE_QUALITY: 0.92,
  VIDEO_QUALITY: 0.92,

  // Video constraints
  MAX_VIDEO_DURATION_MS: 60_000, // 60 seconds

  // Text input configuration
  MAX_TEXT_LENGTH: 320,
  MIN_TEXT_HEIGHT: 80,

  // Display configuration
  DEFAULT_VIDEO_ASPECT_RATIO: 0.85,
  DEFAULT_IMAGE_ASPECT_RATIO: 0.75,
  IMAGE_GRID_ITEM_WIDTH: "30%",
  SINGLE_IMAGE_ASPECT_RATIO: 0.85,
  MEDIA_GRID_ASPECT_RATIO: 1,
  MEDIA_GRID_MAX_ITEMS: 4,

  // Colors
  PLACEHOLDER_COLOR: "#E2E8F0",
  PLACEHOLDER_COLOR_ALT: "#CBD5E1",
  TEXT_PLACEHOLDER_COLOR: "#94A3B8",

  // Cache
  CACHE_FILE_PREFIX: "moment-video-",
} as const;

export const ANIMATION_CONFIG = {
  // Durations (in milliseconds)
  VIDEO_BUTTON_FADE: 200,
  SHEET_ANIMATION: 180,
  TAB_ANIMATION: 140,

  // Snap points
  UPLOAD_SHEET_SNAP_POINTS: ["45%", "60%"] as const,
  MOMENT_SHEET_SNAP_POINTS: ["46%", "86%"] as const,

  // Opacity values
  BACKDROP_OPACITY_LIGHT: 0.08,
  BACKDROP_OPACITY_MEDIUM: 0.4,

  // Blur
  BACKDROP_BLUR_INTENSITY: 28,
} as const;

export const SCROLL_CONFIG = {
  // Scroll behavior thresholds
  HIDE_THRESHOLD: 6,
  SHOW_THRESHOLD: -6,
  MIN_OFFSET: 16,
  AUTO_HIDE_OFFSET: 120,
} as const;

export const UI_SIZES = {
  // Button sizes
  CENTER_BUTTON_SIZE: 50,
  CENTER_BUTTON_ICON_SIZE: 28,
  CENTER_BUTTON_MARGIN_TOP: -12,

  // Close button sizes
  CLOSE_BUTTON_DEFAULT: 8,
  CLOSE_BUTTON_LARGE: 9,
  CLOSE_ICON_DEFAULT: 18,
  CLOSE_ICON_LARGE: 20,

  // Play button
  PLAY_BUTTON_SIZE: 14,
  PLAY_ICON_SIZE: 30,

  // Media editor icons
  MEDIA_EDITOR_ICON_SIZE: 18,
} as const;

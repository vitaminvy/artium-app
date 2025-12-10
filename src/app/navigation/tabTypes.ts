import { Ionicons } from "@expo/vector-icons";

// --- Types ---

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Feed: undefined;
  Upload: undefined;
  UploadOptions: undefined;
};

export type TabMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isCenter?: boolean;
  opensSheet?: boolean;
};

// --- Configurations ---

export const TAB_META: Record<keyof TabParamList, TabMeta> = {
  Home: { icon: "home-outline", label: "Home" },
  Feed: { icon: "globe-outline", label: "Feed" },
  Upload: { icon: "cash-outline", label: "Quick Sell", isCenter: true },
  Discover: { icon: "search-outline", label: "Discover" },
  UploadOptions: { icon: "add-outline", label: "Upload", opensSheet: true },
};

export const UPLOAD_OPTIONS = [
  {
    title: "Upload inventory",
    subtitle: "Supports GIF, PNG, JPG, JPEG, HEIC",
    icon: "image-outline" as const,
    iconColor: "#0F172A",
    tint: "#E0F2FE",
  },
  {
    title: "Post a Moment",
    subtitle: "Videos of your thoughts, moments, or anything you'd like to share.",
    icon: "videocam-outline" as const,
    iconColor: "#0F172A",
    tint: "#E4E9F2",
  },
  {
    title: "Create an Invoice",
    subtitle: "Easily create and send invoices for your artwork sales",
    icon: "document-text-outline" as const,
    iconColor: "#0F172A",
    tint: "#E9D5FF",
  },
];

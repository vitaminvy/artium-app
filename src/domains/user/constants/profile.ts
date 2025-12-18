import { ProfileTabKey } from "../types";

export const PROFILE_ACCENT = "#9BE163";

export const PROFILE_TABS: { key: ProfileTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "artworks", label: "Artworks" },
  { key: "moments", label: "Moments" },
  { key: "moodboards", label: "Moodboards" },
];

export const PROFILE_STRINGS = {
  headerTitle: "PROFILE",
  featuredTitle: "Featured Artworks",
  featuredDescription:
    "Select up to 5 artworks from your Storefront to featured on your profile",
  storefrontCta: "Set Up My Storefront",
  momentsTitle: "Moments",
  artworksEmpty:
    "You have not uploaded any artwork yet\nStart uploading one now!",
  momentsEmpty: "You have not added any moment yet",
  moodboardCta: "Create Moodboard",
};

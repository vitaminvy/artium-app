// TypeScript definitions for User domain

export type ProfileTabKey = "overview" | "artworks" | "moments" | "moodboards";

export type ProfileStats = {
  followers: number;
  following: number;
};

export type ProfileUser = {
  id: string;
  name: string;
  handle: string;
  avatarColor?: string;
  avatarLabel?: string;
};

export type ProfileFeaturedArtwork = {
  id: string;
  title?: string;
  image?: string;
};

export type ProfileMoodboard = {
  id: string;
  title: string;
  visibility: "private" | "public";
  ownerName: string;
  previewColor?: string;
};

export type ProfileViewModel = {
  user: ProfileUser;
  stats: ProfileStats;
  featuredArtworks: ProfileFeaturedArtwork[];
  moodboards: ProfileMoodboard[];
};

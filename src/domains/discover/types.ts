// TypeScript definitions for Discover domain

export type DiscoverTab =
  | "topPicks"
  | "nearby"
  | "artworks"
  | "profiles"
  | "moments"
  | "events"
  | "inspiration";

export type Badge = {
  label: string;
  color: string;
  tint?: string;
};

export type Artwork = {
  id: string;
  title: string;
  artist: string;
  artistAvatar?: string;
  image: string;
  isTrending?: boolean;
  spice?: boolean;
  location?: string;
};

export type ArtistProfile = {
  id: string;
  name: string;
  title?: string;
  avatar: string;
  verified?: boolean;
  location?: string;
};

export type EventItem = {
  id: string;
  title: string;
  location: string;
  datetime: string; // ISO string
  image: string;
  attendees?: number;
  status?: "ongoing" | "upcoming";
  rsvpLabel?: string;
};

export type InspirationArticle = {
  id: string;
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  image: string;
};

export type SearchSuggestion = {
  id: string;
  text: string;
};

export type DiscoverData = {
  artworks: Artwork[];
  profiles: ArtistProfile[];
  moments: Artwork[];
  events: EventItem[];
  inspirations: InspirationArticle[];
};

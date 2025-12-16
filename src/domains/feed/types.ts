// Type definitions cho domain Feed

export type FeedTab = "explore" | "following";

export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  verified?: boolean;
  isFollowed?: boolean; // whether current user follows the author (used for Following tab)
  isMe?: boolean; // author is the current user (pin to top on Following)
};

export type FeedMedia = {
  url?: string;
  placeholderColor?: string;
  aspectRatio?: number; // w/h, defaults to 4/5
  type?: "image" | "video";
  durationMs?: number;
};

export type FeedComment = {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: number;
  relativeTime?: string;
};

export type FeedQuote = {
  authorName: string;
  handle: string;
  content: string;
  createdAt: number;
  relativeTime: string;
  media?: FeedMedia;
};

export type FeedMetrics = {
  likes: number;
  comments: number;
  shares: number;
};

export type FeedPost = {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: number;
  relativeTime?: string;
  media?: FeedMedia;
  quote?: FeedQuote;
  isReshare?: boolean; // flag when the post is a reshare
  resharedFrom?: FeedAuthor; // original author of the reshared post
  metrics: FeedMetrics;
  liked?: boolean;
  reshared?: boolean;
};

export type FeedData = {
  posts: FeedPost[];
  defaultTab?: FeedTab;
};

export type PostMomentMedia = {
  type: "image" | "video";
  uri: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  durationMs?: number;
};

export type PostMomentDraft = {
  text: string;
  media?: PostMomentMedia;
};

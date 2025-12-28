// Type definitions cho domain Feed

export * from "./types/video";

export type FeedTab = "explore" | "following" | "myFeed";

export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  verified?: boolean;
  isFollowed?: boolean; // whether current user follows the author (used for Following tab)
  isMe?: boolean; // author is the current user (pin to top on Following)
};

export type FeedImageItem =
  | string
  | {
      uri: string;
      width?: number;
      height?: number;
    };

export type FeedMedia =
  | {
      type: "image";
      items: FeedImageItem[];
      placeholderColor?: string;
      aspectRatio?: number;
    }
  | {
      type: "video";
      uri: string;
      durationMs?: number;
      placeholderColor?: string;
      aspectRatio?: number;
    }
  | {
      // Legacy single image shape for backward compatibility
      type?: "image";
      url?: string;
      placeholderColor?: string;
      aspectRatio?: number;
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
  id?: string;
  authorId?: string;
  authorName: string;
  handle: string;
  avatar?: string;
  title?: string;
  subtitle?: string;
  priceLabel?: string;
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

export type PostMomentImageItem = {
  uri: string;
  width?: number;
  height?: number;
};

export type PostMomentMedia =
  | {
      type: "image";
      items: PostMomentImageItem[];
    }
  | {
      type: "video";
      uri: string;
      durationMs?: number;
      width?: number;
      height?: number;
      aspectRatio?: number;
    };

export type PostMomentDraft = {
  text: string;
  media?: PostMomentMedia;
};

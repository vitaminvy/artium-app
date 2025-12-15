// Type definitions cho domain Feed

export type FeedTab = "explore" | "following";

export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  verified?: boolean;
  isFollowed?: boolean; // đã follow hay chưa (phục vụ filter Following)
  isMe?: boolean; // bài mình đăng để ưu tiên trên Following
};

export type FeedMedia = {
  url?: string;
  placeholderColor?: string;
  aspectRatio?: number; // w/h, mặc định 4/5
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
  isReshare?: boolean; // đánh dấu bài đăng lại
  resharedFrom?: FeedAuthor; // ai là tác giả gốc của bài được share
  metrics: FeedMetrics;
  liked?: boolean;
  reshared?: boolean;
};

export type FeedData = {
  posts: FeedPost[];
  defaultTab?: FeedTab;
};

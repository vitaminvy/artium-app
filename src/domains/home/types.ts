import type { Artwork } from "../discover/types";

export type HomeNewsItem = {
  id: string;
  title: string;
  dateLabel: string;
  image: string;
  tag?: string;
};

export type HomeBlogItem = {
  id: string;
  title: string;
  author: string;
  dateLabel: string;
  image: string;
  authorAvatar?: string;
  excerpt?: string;
};

export type HomeEventItem = {
  id: string;
  title: string;
  dateLabel: string;
  dateISO?: string;
  image: string;
  label?: string;
};

export type HomeFollowingProfile = {
  id: string;
  name: string;
  subtitle?: string;
  avatar: string;
  verified?: boolean;
  actionLabel?: string;
};

export type HomeData = {
  news: HomeNewsItem[];
  blogs: HomeBlogItem[];
  events: HomeEventItem[];
  sellItems: Artwork[];
  following: HomeFollowingProfile[];
};

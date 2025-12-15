import { FeedData, FeedPost } from "./types";

const now = Date.now();

const posts: FeedPost[] = [
  {
    id: "feed-1",
    author: {
      id: "author-jennifer",
      name: "Jennifer Connelly",
      handle: "jenconnelly",
      isFollowed: false,
    },
    content: "Dani Lee's caption @louisezhang",
    createdAt: now - 60 * 1000,
    relativeTime: "1m",
    media: {
      placeholderColor: "#A8B7C6",
      aspectRatio: 1,
    },
    metrics: {
      likes: 12,
      comments: 4,
      shares: 2,
    },
    liked: false,
    reshared: false,
  },
  {
    id: "feed-2",
    author: {
      id: "author-jade",
      name: "Jade Beckham",
      handle: "jade.beckham",
      isFollowed: true,
      verified: true,
    },
    content:
      "Visiting out Louise Zhang's latest installation in Sydney. So good!",
    createdAt: now - 90 * 1000,
    relativeTime: "1m",
    metrics: {
      likes: 54000,
      comments: 210,
      shares: 88,
    },
    liked: false,
    reshared: false,
  },
  {
    id: "feed-3",
    author: {
      id: "author-jade",
      name: "Jade Beckham",
      handle: "jade.beckham",
      isFollowed: true,
      verified: true,
    },
    content: "Check out Louise Zhang's latest artwork! So good!",
    createdAt: now - 5 * 60 * 1000,
    relativeTime: "5m",
    quote: {
      authorName: "Jade Beckham",
      handle: "jade.beckham",
      content:
        "Visiting out Louise Zhang's latest installation in Sydney. So good!",
      createdAt: now - 4 * 60 * 1000,
      relativeTime: "5m",
      media: {
        placeholderColor: "#E2E8F0",
        aspectRatio: 2.3,
      },
    },
    isReshare: true,
    resharedFrom: {
      id: "author-jade",
      name: "Jade Beckham",
      handle: "jade.beckham",
    },
    metrics: {
      likes: 54000,
      comments: 210,
      shares: 88,
    },
    liked: false,
    reshared: false,
  },
  {
    id: "feed-4",
    author: {
      id: "author-dani",
      name: "Dani Lee",
      handle: "dani.lee",
      isFollowed: true,
    },
    content:
      "Visiting out Louise Zhang's latest installation in Sydney. So good!",
    createdAt: now - 60 * 1000,
    relativeTime: "1m",
    media: {
      placeholderColor: "#A8B7C6",
      aspectRatio: 0.85,
    },
    metrics: {
      likes: 1200,
      comments: 32,
      shares: 15,
    },
    liked: false,
    reshared: false,
  },
  {
    id: "feed-5",
    author: {
      id: "author-me",
      name: "You",
      handle: "you",
      isFollowed: true,
      isMe: true,
    },
    content: "New studio drop just went live. Thoughts?",
    createdAt: now - 30 * 1000,
    relativeTime: "Just now",
    media: {
      placeholderColor: "#CBD5E1",
      aspectRatio: 1.1,
    },
    metrics: {
      likes: 2,
      comments: 0,
      shares: 0,
    },
    liked: false,
    reshared: false,
  },
];

export const feedMockData: FeedData = {
  posts,
  defaultTab: "explore",
};

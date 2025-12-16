import { useCallback, useMemo, useState } from "react";
import { FeedComment, FeedPost, FeedTab } from "../types";
import { feedMockData } from "../mockData";
import { CURRENT_USER } from "../constants";

type UseFeedResult = {
  tab: FeedTab;
  setTab: (tab: FeedTab) => void;
  explorePosts: FeedPost[];
  followingPosts: FeedPost[];
  toggleLike: (id: string) => void;
  createReshare: (targetId: string, note: string) => void;
  commentsByPost: Record<string, FeedComment[]>;
  addComment: (postId: string, content: string) => void;
  addMomentPost: (post: FeedPost) => void;
};

const formatTimeAgo = (createdAt: number) => {
  const diff = Date.now() - createdAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes <= 0) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

function attachRelativeTime(posts: FeedPost[]): FeedPost[] {
  return posts.map((post) => ({
    ...post,
    relativeTime: post.relativeTime ?? formatTimeAgo(post.createdAt),
    quote: post.quote
      ? {
          ...post.quote,
          relativeTime:
            post.quote.relativeTime ?? formatTimeAgo(post.quote.createdAt),
        }
      : undefined,
  }));
}

function sortByCreatedAt(posts: FeedPost[]) {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}

export function useFeed(): UseFeedResult {
  const [tab, setTab] = useState<FeedTab>(feedMockData.defaultTab ?? "explore");
  const [posts, setPosts] = useState<FeedPost[]>(() =>
    attachRelativeTime(feedMockData.posts)
  );
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, FeedComment[]>
  >({});

  const explorePosts = useMemo(() => sortByCreatedAt(posts), [posts]);

  const followingPosts = useMemo(() => {
    const filtered = posts.filter(
      (post) => post.author.isFollowed || post.author.isMe
    );
    const sorted = sortByCreatedAt(filtered);
    sorted.sort((a, b) => Number(!!b.author.isMe) - Number(!!a.author.isMe));
    return sorted;
  }, [posts]);

  const toggleLike = useCallback((id: string) => {
    setPosts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const target = prev[idx];
      next[idx] = {
        ...target,
        liked: !target.liked,
        metrics: {
          ...target.metrics,
          likes: target.metrics.likes + (target.liked ? -1 : 1),
        },
      };
      return next;
    });
  }, []);

  const addComment = useCallback(
    (postId: string, content: string) => {
      if (!content.trim()) return;
      const newComment: FeedComment = {
        id: `cmt-${Date.now()}`,
        author: CURRENT_USER,
        content: content.trim(),
        createdAt: Date.now(),
        relativeTime: "Just now",
      };

      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] ?? [])],
      }));

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                metrics: {
                  ...post.metrics,
                  comments: post.metrics.comments + 1,
                },
              }
            : post
        )
      );
    },
    []
  );

  const createReshare = useCallback((targetId: string, note: string) => {
    setPosts((prev) => {
      const target = prev.find((p) => p.id === targetId);
      if (!target) return prev;

      const nowTs = Date.now();

      const quote: FeedPost["quote"] = {
        authorName: target.author.name,
        handle: target.author.handle,
        content: target.content,
        createdAt: target.createdAt,
        relativeTime: target.relativeTime ?? formatTimeAgo(target.createdAt),
        media: target.media,
      };

      const newPost: FeedPost = {
        id: `reshare-${nowTs}`,
        author: CURRENT_USER,
        content: note.trim(),
        createdAt: nowTs,
        relativeTime: "Just now",
        quote,
        isReshare: true,
        resharedFrom: target.author,
        metrics: {
          likes: 0,
          comments: 0,
          shares: 0,
        },
        liked: false,
        reshared: false,
      };

      return [
        newPost,
        ...prev.map((post) =>
          post.id === targetId
            ? {
                ...post,
                metrics: {
                  ...post.metrics,
                  shares: post.metrics.shares + 1,
                },
              }
            : post
        ),
      ];
    });
  }, []);

  const addMomentPost = useCallback((post: FeedPost) => {
    const normalized: FeedPost = {
      ...post,
      relativeTime: post.relativeTime ?? formatTimeAgo(post.createdAt),
      quote: post.quote
        ? {
            ...post.quote,
            relativeTime:
              post.quote.relativeTime ?? formatTimeAgo(post.quote.createdAt),
          }
        : undefined,
    };
    setPosts((prev) => [normalized, ...prev]);
  }, []);

  return {
    tab,
    setTab,
    explorePosts,
    followingPosts,
    toggleLike,
    createReshare,
    commentsByPost,
    addComment,
    addMomentPost,
  };
}

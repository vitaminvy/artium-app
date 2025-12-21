import { useCallback, useEffect, useMemo, useState } from "react";
import { User as AuthUser } from "firebase/auth"; // Import Firebase user type
import { FeedComment, FeedPost, FeedTab } from "../types";
import {  addCommentToPost, createPost, subscribeToFeedPosts, togglePostLike } from "./services/feedService";

type UseFeedResult = {
  tab: FeedTab;
  setTab: (tab: FeedTab) => void;
  loading: boolean;
  isRefreshing: boolean; // Add for pull-to-refresh
  onRefresh: () => Promise<void>; // Add for pull-to-refresh
  error: Error | null;
  explorePosts: FeedPost[];
  followingPosts: FeedPost[];
  toggleLike: (id: string, isCurrentlyLiked: boolean) => Promise<void>;
  createReshare: (targetId: string, note: string) => void;
  commentsByPost: Record<string, FeedComment[]>;
  addComment: (postId: string, content: string) => void;
  addMomentPost: (post: Omit<FeedPost, 'id' | 'author' | 'createdAt' | 'metrics' | 'relativeTime'>) => Promise<void>;
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

export function useFeed(currentUser: AuthUser | null): UseFeedResult {
  const [tab, setTab] = useState<FeedTab>("explore");
  
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, FeedComment[]>
  >({});

  // Set up the real-time listener
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToFeedPosts(
      (fetchedPosts) => {
        setPosts(attachRelativeTime(fetchedPosts));
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      },
      currentUser?.uid || null
    );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [currentUser]);

  // Manual refresh function (for UI feedback, actual data update is via listener)
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate a short delay for UX, as listener handles actual data update
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setIsRefreshing(false);
  }, []);

  const explorePosts = useMemo(() => sortByCreatedAt(posts), [posts]);

  const followingPosts = useMemo(() => {
    if (!currentUser) return [];
    const filtered = posts.filter(
      (post) => post.author.isFollowed || post.author.id === currentUser.uid
    );
    const sorted = sortByCreatedAt(filtered);
    sorted.sort((a, b) => Number(b.author.id === currentUser.uid) - Number(a.author.id === currentUser.uid));
    return sorted;
  }, [posts, currentUser]);

  const toggleLike = useCallback(async (id: string, isCurrentlyLiked: boolean) => {
    // Optimistic UI update
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

    // Call backend service
    try {
      if (currentUser) {
        console.log(`Calling togglePostLike with: postId=${id}, userId=${currentUser.uid}, isCurrentlyLiked=${isCurrentlyLiked}`);
        await togglePostLike(id, currentUser.uid, isCurrentlyLiked);
      }
    } catch (error) {
      console.error("Failed to update like status on backend:", error);
      // Revert UI on failure
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
            likes: target.metrics.likes + (target.liked ? 1 : -1),
          },
        };
        return next;
      });
    }
  }, [currentUser]);
  
  const addComment = useCallback(
    async (postId: string, content: string) => {
      if (!content.trim() || !currentUser) return; // Ensure content and user exist

      try {
        // Optimistic UI update for comments list in the sheet
        const tempCommentId = `temp-cmt-${Date.now()}`;
        const newLocalComment: FeedComment = {
            id: tempCommentId,
            author: { // Use currentUser info directly
              id: currentUser.uid,
              name: currentUser.displayName || "You",
              handle: (currentUser.displayName || "you").replace(/\s+/g, "").toLowerCase(),
              avatar: currentUser.photoURL || undefined,
            },
            content: content.trim(),
            createdAt: Date.now(),
            relativeTime: "Just now",
          };

        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: [newLocalComment, ...(prev[postId] ?? [])],
        }));

        // Call backend service to add comment and increment count
        await addCommentToPost(postId, {
          authorId: currentUser.uid,
          content: content.trim(),
        });

      } catch (error) {
        console.error("Failed to add comment to backend:", error);
        // Implement rollback for optimistic update here if necessary, or show alert
        // A simple rollback would be to remove the tempCommentId from commentsByPost
      }
    },
    [currentUser]
  );

  const createReshare = useCallback((targetId: string, note: string) => {
    console.log("createReshare to be implemented with backend call");
  }, []);

  const addMomentPost = useCallback(async (post: Omit<FeedPost, 'id' | 'author' | 'createdAt' | 'metrics' | 'relativeTime'>) => {
    if (!currentUser) {
      throw new Error("User must be logged in to create a post.");
    }

    let mediaUrl: string | undefined;
    if (post.media?.type === "video") {
      mediaUrl = post.media.uri;
    } else if (post.media?.type === "image" && "items" in post.media && post.media.items && post.media.items.length > 0) {
     const firstItem = post.media.items[0];
      mediaUrl = typeof firstItem === 'string' ? firstItem : firstItem.uri;''
    }
    
    await createPost({
      authorId: currentUser.uid,
      content: post.content,
      mediaUrl: mediaUrl,
    });

  }, [currentUser]);

  return {
    tab,
    setTab,
    loading,
    isRefreshing,
    onRefresh,
    error,
    explorePosts,
    followingPosts,
    toggleLike,
    createReshare,
    commentsByPost,
    addComment,
    addMomentPost,
  };
}

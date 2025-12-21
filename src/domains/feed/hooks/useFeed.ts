import { useCallback, useEffect, useMemo, useState } from "react";
import { User as AuthUser } from "firebase/auth"; // Import Firebase user type
import { FeedComment, FeedPost, FeedTab } from "../types";
import {  addCommentToPost, createPost, getFeedPosts, togglePostLike } from "./services/feedService";

type UseFeedResult = {
  tab: FeedTab;
  setTab: (tab: FeedTab) => void;
  loading: boolean;
  error: Error | null;
  explorePosts: FeedPost[];
  followingPosts: FeedPost[];
  toggleLike: (id: string) => void;
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
  const [error, setError] = useState<Error | null>(null);

  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, FeedComment[]>
  >({});

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedPosts = await getFeedPosts();
      setPosts(attachRelativeTime(fetchedPosts));
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
  }, [posts]);
  
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

        // After successful comment, refetch posts to update the comment count on the post
        await fetchPosts(); 

      } catch (error) {
        console.error("Failed to add comment to backend:", error);
        // Implement rollback for optimistic update here if necessary, or show alert
        // A simple rollback would be to remove the tempCommentId from commentsByPost
      }
    },
    [currentUser, fetchPosts]
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
    } else if (post.media?.type === "image" && post.media.items && post.media.items.length > 0) {
      mediaUrl = post.media.items[0].uri;
    }
    
    await createPost({
      authorId: currentUser.uid,
      content: post.content,
      mediaUrl: mediaUrl,
    });
    
    await fetchPosts();

  }, [currentUser, fetchPosts]);

  return {
    tab,
    setTab,
    loading,
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

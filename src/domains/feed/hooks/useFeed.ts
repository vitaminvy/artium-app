import { useCallback, useEffect, useMemo, useState } from "react";
import { User as AuthUser } from "firebase/auth";
import { FeedComment, FeedPost, FeedTab } from "../types";
import { 
  addCommentToPost, 
  createPost, 
  subscribeToFeedPosts, 
  togglePostLike 
} from "../services/feedService";

type UseFeedResult = {
  tab: FeedTab;
  setTab: (tab: FeedTab) => void;
  loading: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
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
    relativeTime: formatTimeAgo(post.createdAt),
    quote: post.quote
      ? {
          ...post.quote,
          relativeTime: formatTimeAgo(post.quote.createdAt),
        }
      : undefined,
  }));
}

export function useFeed(currentUser: AuthUser | null): UseFeedResult {
  const [tab, setTab] = useState<FeedTab>("explore");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [commentsByPost, setCommentsByPost] = useState<Record<string, FeedComment[]>>({});

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
    return () => unsubscribe();
  }, [currentUser]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setIsRefreshing(false);
  }, []);

  const explorePosts = useMemo(() => posts, [posts]);

  const followingPosts = useMemo(() => {
    if (!currentUser) return [];
    // Currently showing same as explore or filter by followed
    return posts.filter(p => p.author?.isFollowed || p.author?.id === currentUser.uid);
  }, [posts, currentUser]);

  const toggleLike = useCallback(async (id: string, isCurrentlyLiked: boolean) => {
    if (!currentUser) return;
    try {
      await togglePostLike(id, currentUser.uid, isCurrentlyLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  }, [currentUser]);
  
  const addComment = useCallback(async (postId: string, content: string) => {
    if (!content.trim() || !currentUser) return;

    try {
      const authorSnapshot = {
        id: currentUser.uid,
        name: currentUser.displayName || "User",
        handle: (currentUser.email || "user").split("@")[0],
        avatar: currentUser.photoURL || undefined,
      };

      await addCommentToPost(postId, {
        authorSnapshot,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }, [currentUser]);

  const createReshare = useCallback((targetId: string, note: string) => {
    // To be implemented
  }, []);

  const addMomentPost = useCallback(async (post: any) => {
    if (!currentUser) throw new Error("User not logged in");

    const authorSnapshot = {
      id: currentUser.uid,
      name: currentUser.displayName || "User",
      handle: (currentUser.email || "user").split("@")[0],
      avatar: currentUser.photoURL || undefined,
    };

    await createPost({
      authorId: currentUser.uid,
      authorSnapshot,
      content: post.content,
      media: post.media,
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

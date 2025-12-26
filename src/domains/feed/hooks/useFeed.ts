import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { User as AuthUser } from "firebase/auth";
import { FeedComment, FeedPost, FeedTab } from "../types";
import { 
  addCommentToPost, 
  createPost, 
  getFeedPosts, 
  togglePostLike,
  subscribeToFeedPosts
} from "../services/feedService";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

const POST_PAGE_SIZE = 5;

type UseFeedResult = {
  tab: FeedTab;
  setTab: (tab: FeedTab) => void;
  loading: boolean;
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
  error: Error | null;
  explorePosts: FeedPost[];
  followingPosts: FeedPost[];
  myPosts: FeedPost[];
  loadMorePosts: () => void;
  hasMorePosts: boolean;
  isMorePostsLoading: boolean;
  toggleLike: (id: string, currentLikedStatus: boolean) => Promise<void>;
  createReshare: (targetPost: FeedPost, note: string) => void;
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
  const [pageSize, setPageSize] = useState(POST_PAGE_SIZE);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isMorePostsLoading, setIsMorePostsLoading] = useState(false);
  const likeInFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    let unsubscribe: () => void;

    const setupSubscription = async () => {
      // If we are refreshing, we might want to reset pageSize, but let's handle that in onRefresh
      try {
        setLoading(true);
        unsubscribe = subscribeToFeedPosts(
          pageSize,
          (newPosts, lastVisible) => {
            setPosts(attachRelativeTime(newPosts));
            // Check if we reached the end (fewer posts returned than requested, or just heuristic)
            // Note: This heuristic might be slightly off if total posts is exact multiple of pageSize
            // But good enough for now.
            setHasMorePosts(newPosts.length >= pageSize); 
            setLoading(false);
            setIsMorePostsLoading(false);
          },
          currentUser?.uid
        );
      } catch (e: any) {
        setError(e);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [pageSize, currentUser]); // Re-subscribe if pageSize increases or user changes

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPageSize(POST_PAGE_SIZE); // This will trigger the effect above
    // We wait a bit to simulate refresh or let the subscription update
    setTimeout(() => {
        setIsRefreshing(false);
    }, 1000);
  }, []);

  const loadMorePosts = useCallback(() => {
    if (isMorePostsLoading || !hasMorePosts) return;
    setIsMorePostsLoading(true);
    setPageSize(prev => prev + POST_PAGE_SIZE);
  }, [isMorePostsLoading, hasMorePosts]);

  const explorePosts = useMemo(() => posts, [posts]);

  const followingPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.author?.isFollowed || p.author?.id === currentUser.uid);
  }, [posts, currentUser]);

  const myPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.author?.id === currentUser.uid);
  }, [posts, currentUser]);

  const toggleLike = useCallback(async (id: string, currentLikedStatus: boolean) => {
    if (!currentUser) return;
    if (likeInFlight.current.has(id)) return;
    likeInFlight.current.add(id);
    
    // Optimistic update
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === id) {
        const newLikedState = !currentLikedStatus;
        const newLikesCount = currentLikedStatus 
          ? Math.max(0, p.metrics.likes - 1) // Unliking
          : p.metrics.likes + 1;             // Liking

        return {
          ...p,
          liked: newLikedState,
          metrics: { ...p.metrics, likes: newLikesCount }
        }
      }
      return p;
    }));

    try {
      await togglePostLike(id, currentUser.uid, currentLikedStatus);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert optimistic update
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === id) {
          return {
            ...p,
            liked: currentLikedStatus,
            metrics: { 
              ...p.metrics, 
              likes: currentLikedStatus ? p.metrics.likes + 1 : Math.max(0, p.metrics.likes - 1)
            }
          }
        }
        return p;
      }));
    } finally {
      likeInFlight.current.delete(id);
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

  const createReshare = useCallback(async (targetPost: FeedPost, note: string) => {
    if (!currentUser) return;

    const authorSnapshot = {
      id: currentUser.uid,
      name: currentUser.displayName || "User",
      handle: (currentUser.email || "user").split("@")[0],
      avatar: currentUser.photoURL || undefined,
    };

    const quote = {
      authorName: targetPost.author.name,
      handle: targetPost.author.handle,
      content: targetPost.content,
      createdAt: targetPost.createdAt,
      media: targetPost.media,
    };

    await createPost({
      authorId: currentUser.uid,
      authorSnapshot,
      content: note,
      media: null,
      quote: quote,
      isReshare: true,
      resharedFrom: targetPost.author,
    } as any);

    onRefresh();
  }, [currentUser, onRefresh]);

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
      media: post.media || null,
    });
    onRefresh();
  }, [currentUser, onRefresh]);

  return {
    tab,
    setTab,
    loading,
    isRefreshing,
    onRefresh,
    error,
    explorePosts,
    followingPosts,
    myPosts,
    loadMorePosts,
    hasMorePosts,
    isMorePostsLoading,
    toggleLike,
    createReshare,
    addComment,
    addMomentPost,
  };
}

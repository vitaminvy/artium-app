import { useCallback, useEffect, useMemo, useState } from "react";
import { User as AuthUser } from "firebase/auth";
import { FeedComment, FeedPost, FeedTab } from "../types";
import { 
  addCommentToPost, 
  createPost, 
  getFeedPosts, 
  togglePostLike 
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
  toggleLike: (id: string) => Promise<void>;
  createReshare: (targetPost: FeedPost, note: string) => void;
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
  const [lastPostDoc, setLastPostDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isMorePostsLoading, setIsMorePostsLoading] = useState(false);

  const [commentsByPost, setCommentsByPost] = useState<Record<string, FeedComment[]>>({});

  const fetchInitialPosts = useCallback(async () => {
    try {
      setLoading(true);
      const { posts: newPosts, lastVisible } = await getFeedPosts(POST_PAGE_SIZE);
      setPosts(attachRelativeTime(newPosts));
      setLastPostDoc(lastVisible);
      setHasMorePosts(newPosts.length === POST_PAGE_SIZE);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialPosts();
  }, [fetchInitialPosts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchInitialPosts();
    setIsRefreshing(false);
  }, [fetchInitialPosts]);

  const loadMorePosts = useCallback(async () => {
    if (isMorePostsLoading || !hasMorePosts) return;
    setIsMorePostsLoading(true);
    try {
      const { posts: newPosts, lastVisible } = await getFeedPosts(POST_PAGE_SIZE, lastPostDoc);
      setPosts(prev => attachRelativeTime([...prev, ...newPosts]));
      setLastPostDoc(lastVisible);
      setHasMorePosts(newPosts.length === POST_PAGE_SIZE);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsMorePostsLoading(false);
    }
  }, [isMorePostsLoading, hasMorePosts, lastPostDoc]);

  const explorePosts = useMemo(() => posts, [posts]);

  const followingPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.author?.isFollowed || p.author?.id === currentUser.uid);
  }, [posts, currentUser]);

  const myPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.author?.id === currentUser.uid);
  }, [posts, currentUser]);

  const toggleLike = useCallback(async (id: string) => {
    if (!currentUser) return;
    
    setPosts(prevPosts => prevPosts.map(p => {
      if (p.id === id) {
        const newLikedState = !p.liked;
        const newLikesCount = newLikedState ? p.metrics.likes + 1 : p.metrics.likes - 1;
        return {
          ...p,
          liked: newLikedState,
          metrics: { ...p.metrics, likes: newLikesCount }
        }
      }
      return p;
    }));

    try {
      await togglePostLike(id, currentUser.uid);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === id) {
          const originalLikedState = !p.liked;
          const originalLikesCount = originalLikedState ? p.metrics.likes + 1 : p.metrics.likes - 1;
          return {
            ...p,
            liked: originalLikedState,
            metrics: { ...p.metrics, likes: originalLikesCount }
          }
        }
        return p;
      }));
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
    commentsByPost,
    addComment,
    addMomentPost,
  };
}
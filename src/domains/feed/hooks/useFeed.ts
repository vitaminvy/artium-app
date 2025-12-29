import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { User as AuthUser } from "firebase/auth";
import { FeedComment, FeedPost, FeedTab } from "../types";
import {
  addCommentToPost,
  createPost,
  getFeedPosts,
  togglePostLike,
} from "../services/feedService";
import { QueryDocumentSnapshot, DocumentData, collection, onSnapshot } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { useProfileContext } from "@/domains/user/contexts/ProfileContext";

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
  const { profile } = useProfileContext();
  const [tab, setTab] = useState<FeedTab>("explore");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isMorePostsLoading, setIsMorePostsLoading] = useState(false);
  const likeInFlight = useRef<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const lastVisibleRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const authorSnapshot = useMemo(() => {
    if (!currentUser) return null;
    const rawHandle =
      profile.user.handle ||
      (currentUser.email ? currentUser.email.split("@")[0] : "user");
    const handle = rawHandle.startsWith("@") ? rawHandle.slice(1) : rawHandle;
    const name =
      profile.user.name ||
      currentUser.displayName ||
      currentUser.email ||
      "User";
    const avatar = profile.user.avatarUri || currentUser.photoURL || undefined;
    return {
      id: currentUser.uid,
      name,
      handle,
      avatar,
    };
  }, [
    currentUser,
    profile.user.avatarUri,
    profile.user.handle,
    profile.user.name,
  ]);

  const mergePosts = useCallback((base: FeedPost[], next: FeedPost[]) => {
    const map = new Map<string, FeedPost>();
    base.forEach((post) => map.set(post.id, post));
    next.forEach((post) => map.set(post.id, post));
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, []);

  const loadPosts = useCallback(
    async ({ reset }: { reset: boolean }) => {
      try {
        if (reset) {
          setLoading(true);
          setError(null);
          lastVisibleRef.current = null;
        }
        const cursor = reset ? null : lastVisibleRef.current;
        const { posts: fetched, lastVisible: nextCursor } = await getFeedPosts(
          POST_PAGE_SIZE,
          cursor,
          currentUser?.uid
        );
        setPosts((prev) =>
          attachRelativeTime(reset ? fetched : mergePosts(prev, fetched))
        );
        lastVisibleRef.current = nextCursor;
        setHasMorePosts(fetched.length >= POST_PAGE_SIZE);
      } catch (e: any) {
        setError(e);
      } finally {
        if (reset) setLoading(false);
        setIsMorePostsLoading(false);
      }
    },
    [currentUser?.uid, mergePosts]
  );

  useEffect(() => {
    if (!currentUser) {
      setFollowingIds(new Set());
      return;
    }
    const followingCol = collection(
      firestore,
      "users",
      currentUser.uid,
      "following"
    );
    const unsubFollowing = onSnapshot(followingCol, (snap) => {
      const ids = new Set<string>();
      snap.forEach((doc) => {
        // Document ID is the userId of the followed user
        ids.add(doc.id);
      });
      // console.log("[useFeed] Following IDs:", Array.from(ids));
      setFollowingIds(ids);
    });
    return () => {
      unsubFollowing();
    };
  }, [currentUser]);

  useEffect(() => {
    loadPosts({ reset: true });
  }, [loadPosts]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts({ reset: true });
    setIsRefreshing(false);
  }, [loadPosts]);

  const loadMorePosts = useCallback(() => {
    if (isMorePostsLoading || !hasMorePosts) return;
    setIsMorePostsLoading(true);
    loadPosts({ reset: false });
  }, [isMorePostsLoading, hasMorePosts, loadPosts]);

  const explorePosts = useMemo(() => posts, [posts]);

  const followingPosts = useMemo(() => {
    if (!currentUser) return [];
    const filtered = posts.filter((p) => {
      const authorId = p.author?.id || p.authorId;
      if (!authorId) return false;
      // Only show people currentUser follow (exclude self)
      const isFollowing = followingIds.has(authorId);
      return isFollowing;
    });
    // console.log("[useFeed] Following posts filter:", {
    //   totalPosts: posts.length,
    //   followingIds: Array.from(followingIds),
    //   filteredCount: filtered.length,
    //   samplePost: posts[0]
    //     ? {
    //         id: posts[0].id,
    //         authorId: posts[0].author?.id || posts[0].authorId,
    //         isFollowing: followingIds.has(posts[0].author?.id || posts[0].authorId || ""),
    //       }
    //     : null,
    // });
    return filtered;
  }, [posts, currentUser, followingIds]);

  const myPosts = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter((p) => (p.author?.id || p.authorId) === currentUser.uid);
  }, [posts, currentUser]);

  const toggleLike = useCallback(async (id: string, currentLikedStatus: boolean) => {
    if (!currentUser) return;
    if (likeInFlight.current.has(id)) return;
    likeInFlight.current.add(id);

    try {
      await togglePostLike(id, currentUser.uid, currentLikedStatus);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      likeInFlight.current.delete(id);
    }
  }, [currentUser]);
  
  const addComment = useCallback(async (postId: string, content: string) => {
    if (!content.trim() || !currentUser || !authorSnapshot) return;

    try {
      await addCommentToPost(postId, {
        authorSnapshot,
        content: content.trim(),
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  }, [currentUser, authorSnapshot]);

  const createReshare = useCallback(async (targetPost: FeedPost, note: string) => {
    if (!currentUser || !authorSnapshot) return;

    const quote = {
      id: targetPost.id,
      authorId: targetPost.author.id,
      authorName: targetPost.author.name,
      handle: targetPost.author.handle,
      avatar: targetPost.author.avatar,
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
  }, [currentUser, authorSnapshot, onRefresh]);

  const addMomentPost = useCallback(async (post: any) => {
    if (!currentUser || !authorSnapshot) throw new Error("User not logged in");

    await createPost({
      authorId: currentUser.uid,
      authorSnapshot,
      content: post.content,
      media: post.media || null,
    });
    onRefresh();
  }, [currentUser, authorSnapshot, onRefresh]);

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

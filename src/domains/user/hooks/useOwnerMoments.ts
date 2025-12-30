import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import type { MomentCardItem } from "../components/profile/MomentCard";
import type { FeedMedia, FeedMetrics } from "../../feed/types";

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

/**
 * Hook to fetch moments/posts created by the current user (owner)
 */
export function useOwnerMoments(limitCount: number = 20) {
  const { currentUser } = useAuth();
  const [moments, setMoments] = useState<MomentCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      setMoments([]);
      return;
    }

    const fetchMoments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query posts where authorId matches the current user
        const momentsQuery = query(
          collection(firestore, "posts"),
          where("authorId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );

        const snapshot = await getDocs(momentsQuery);

        const momentsList: MomentCardItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const createdAtMs = (data.createdAt as Timestamp | undefined)?.toMillis?.() ?? Date.now();
          const metrics: FeedMetrics = data.metrics ?? { likes: 0, comments: 0, shares: 0 };
          const media: FeedMedia | undefined = data.media ?? undefined;

          return {
            id: doc.id,
            author: {
              id: data.authorSnapshot?.id || data.authorId || currentUser.uid,
              name: data.authorSnapshot?.name || currentUser.displayName || "Unknown User",
              handle: data.authorSnapshot?.handle || (currentUser.email || "user").split("@")[0],
              avatar: data.authorSnapshot?.avatar || currentUser.photoURL,
              verified: data.authorSnapshot?.verified ?? false,
            },
            title: (data.media?.title as string | undefined) ?? undefined,
            content: data.content || "",
            media: media,
            metrics,
            liked: data.liked ?? false,
            relativeTime: formatTimeAgo(createdAtMs),
            createdAt: createdAtMs,
          };
        });

        setMoments(momentsList);
      } catch (e: any) {
        console.error("Failed to fetch owner moments:", e);
        setError(e);
        setMoments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, [currentUser?.uid, limitCount, refreshKey]);

  return { moments, loading, error, refresh };
}

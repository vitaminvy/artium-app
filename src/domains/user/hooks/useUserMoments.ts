import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, limit, Timestamp } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
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
 * Hook to fetch moments/posts created by a specific user
 */
export function useUserMoments(userId: string, limitCount: number = 20) {
  const [moments, setMoments] = useState<MomentCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchMoments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query posts where authorId matches the userId
        const momentsQuery = query(
          collection(firestore, "posts"),
          where("authorId", "==", userId),
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
              id: data.authorSnapshot?.id || data.authorId || userId,
              name: data.authorSnapshot?.name || "Unknown User",
              handle: data.authorSnapshot?.handle || "user",
              avatar: data.authorSnapshot?.avatar,
              verified: data.authorSnapshot?.verified ?? false,
            },
            title: (data.media?.title as string | undefined) ?? undefined,
            content: data.content || "",
            media: media,
            metrics,
            liked: data.liked ?? false,
            relativeTime: formatTimeAgo(createdAtMs),
          };
        });

        setMoments(momentsList);
      } catch (e: any) {
        console.error("Failed to fetch user moments:", e);
        setError(e);
        setMoments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, [userId, limitCount]);

  return { moments, loading, error };
}

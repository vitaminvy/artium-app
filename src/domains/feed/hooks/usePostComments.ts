import { useState, useEffect } from "react";
import { FeedComment } from "../types";
import { subscribeToPostComments } from "../services/feedService";

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

export function usePostComments(postId: string | undefined) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) {
      setComments([]);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToPostComments(postId, (newComments) => {
      // Add relativeTime
      const withTime = newComments.map(c => ({
        ...c,
        relativeTime: formatTimeAgo(c.createdAt)
      }));
      setComments(withTime);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setLoading(false);
    };
  }, [postId]);

  return { comments, loading };
}

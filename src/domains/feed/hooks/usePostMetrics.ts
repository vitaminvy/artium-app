import { useState, useEffect } from "react";
import { subscribeToPostMetrics } from "../services/feedService";
import { FeedMetrics } from "../types";

export function usePostMetrics(postId: string, initialMetrics?: FeedMetrics) {
  const [metrics, setMetrics] = useState<FeedMetrics>(
    initialMetrics || { likes: 0, comments: 0, shares: 0 }
  );

  useEffect(() => {
    const unsubscribe = subscribeToPostMetrics(postId, (newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, [postId]);

  return metrics;
}

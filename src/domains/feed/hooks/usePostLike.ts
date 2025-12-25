import { useState, useEffect } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { subscribeToPostLike } from "../services/feedService";

export function usePostLike(postId: string, initialLiked?: boolean) {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked ?? false);

  useEffect(() => {
    if (!currentUser) {
      setIsLiked(false);
      return;
    }

    // Set initial state from props to avoid flash if possible, 
    // but the subscription will correct it immediately.
    if (initialLiked !== undefined) {
      setIsLiked(initialLiked);
    }

    const unsubscribe = subscribeToPostLike(postId, currentUser.uid, (liked) => {
      setIsLiked(liked);
    });

    return () => {
      unsubscribe();
    };
  }, [postId, currentUser?.uid]);

  const toggleOptimistic = () => setIsLiked((prev) => !prev);

  return { isLiked, toggleOptimistic };
}

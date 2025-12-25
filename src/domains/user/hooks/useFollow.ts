import { useEffect, useState, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { toggleFollow } from "../services/followService";

type UseFollowResult = {
  isFollowing: boolean;
  toggleFollow: () => Promise<void>;
  loading: boolean;
};

/**
 * Subscribe to follow status and provide a toggle action.
 * - Listens to users/{currentUserId}/following/{targetUserId}
 * - Uses toggleFollow service (transactional; updates counts + subcollections)
 */
export const useFollow = (
  currentUserId: string | undefined,
  targetUserId: string | undefined
): UseFollowResult => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [inFlight, setInFlight] = useState(false);

  useEffect(() => {
    if (!currentUserId || !targetUserId) {
      setIsFollowing(false);
      return;
    }

    const followingDoc = doc(
      firestore,
      "users",
      currentUserId,
      "following",
      targetUserId
    );

    const unsub = onSnapshot(followingDoc, (snap) => {
      setIsFollowing(snap.exists());
    });

    return () => unsub();
  }, [currentUserId, targetUserId]);

  const toggle = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    if (inFlight) return; // 1. Chặn spam

    // 2. Optimistic update
    setInFlight(true);
    setIsFollowing((prev) => !prev);

    const prevFollowing = isFollowing;
    try {
      const res = await toggleFollow(currentUserId, targetUserId);
      setIsFollowing(res.isFollowing); // Sync với kết quả server
    } catch (err) {
      console.error("Failed to toggle follow:", err);
      // 4. Revert nếu lỗi
      setIsFollowing(prevFollowing);
    } finally {
      setInFlight(false); // 5. Cleanup
    }
  }, [currentUserId, targetUserId, inFlight]);

  return { isFollowing, toggleFollow: toggle, loading: inFlight };
};

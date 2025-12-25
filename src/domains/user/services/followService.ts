import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";

type ToggleFollowResult = {
  isFollowing: boolean;
  statsFollowers: number;
  statsFollowing: number;
};

/**
 * Toggle follow between current user and target user.
 * - Prevents self-follow.
 * - Uses subcollections:
 *   - users/{targetId}/followers/{currentUserId}
 *   - users/{currentUserId}/following/{targetId}
 * - Updates stats.followers and stats.following on both user docs.
 */
export const toggleFollow = async (
  currentUserId: string,
  targetUserId: string
): Promise<ToggleFollowResult> => {
  if (!currentUserId || !targetUserId) {
    throw new Error("Both currentUserId and targetUserId are required.");
  }
  if (currentUserId === targetUserId) {
    throw new Error("You cannot follow yourself.");
  }

  const targetRef = doc(firestore, "users", targetUserId);
  const currentRef = doc(firestore, "users", currentUserId);

  const followerRef = doc(collection(targetRef, "followers"), currentUserId);
  const followingRef = doc(collection(currentRef, "following"), targetUserId);

  const result = await runTransaction(firestore, async (tx) => {
    const [targetSnap, currentSnap, followerSnap] = await Promise.all([
      tx.get(targetRef),
      tx.get(currentRef),
      tx.get(followerRef),
    ]);

    if (!targetSnap.exists()) {
      throw new Error("Target user not found.");
    }
    if (!currentSnap.exists()) {
      throw new Error("Current user not found.");
    }

    const targetData = targetSnap.data() || {};
    const currentData = currentSnap.data() || {};

    const alreadyFollowing = followerSnap.exists();

    const followerDelta = alreadyFollowing ? -1 : 1;
    const followingDelta = alreadyFollowing ? -1 : 1;

    const nextStatsFollowers = Math.max(
      0,
      Number((targetData.stats?.followers as number) || 0) + followerDelta
    );
    const nextStatsFollowing = Math.max(
      0,
      Number((currentData.stats?.following as number) || 0) + followingDelta
    );

    if (alreadyFollowing) {
      tx.delete(followerRef);
      tx.delete(followingRef);
    } else {
      tx.set(followerRef, {
        userId: currentUserId,
        createdAt: serverTimestamp(),
      });
      tx.set(followingRef, {
        userId: targetUserId,
        createdAt: serverTimestamp(),
      });
    }

    tx.update(targetRef, {
      "stats.followers": nextStatsFollowers,
    });
    tx.update(currentRef, {
      "stats.following": nextStatsFollowing,
    });

    return {
      isFollowing: !alreadyFollowing,
      statsFollowers: nextStatsFollowers,
      statsFollowing: nextStatsFollowing,
    };
  });

  return result;
};

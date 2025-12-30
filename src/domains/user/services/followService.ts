import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
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

type FollowUser = {
  id: string;
  name: string;
  handle: string;
  avatar?: string | null;
  verified?: boolean;
};

const fetchUserDocsByIds = async (ids: string[]): Promise<FollowUser[]> => {
  if (!ids.length) return [];
  const { getDoc, doc } = await import("firebase/firestore");
  const users: FollowUser[] = [];
  await Promise.all(
    ids.map(async (uid) => {
      const ref = doc(firestore, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        users.push({
          id: uid,
          name: data.displayName || data.name || data.email || "User",
          handle: data.username || data.email || uid,
          avatar: data.avatarUri || data.photoURL || null,
          verified: data.roles?.isArtist ?? false,
        });
      }
    })
  );
  return users;
};

export const fetchFollowers = async (userId: string): Promise<FollowUser[]> => {
  const col = collection(firestore, "users", userId, "followers");
  const snap = await getDocs(col);
  const ids = snap.docs.map((d) => d.id);
  return fetchUserDocsByIds(ids);
};

export const fetchFollowing = async (userId: string): Promise<FollowUser[]> => {
  const col = collection(firestore, "users", userId, "following");
  const snap = await getDocs(col);
  const ids = snap.docs.map((d) => d.id);
  return fetchUserDocsByIds(ids);
};

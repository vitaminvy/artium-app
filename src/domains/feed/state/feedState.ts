import { atom } from "jotai";
import { Unsubscribe } from "firebase/firestore";
import { User as AuthUser } from "firebase/auth";
import { FeedPost } from "../types";
import { subscribeToFeedPosts, getLikedPostIds } from "../hooks/services/feedService";

// --- Core atoms ---
export const postsAtom = atom<FeedPost[]>([]);
export const feedLoadingAtom = atom<boolean>(true);
export const feedErrorAtom = atom<Error | null>(null);
export const likedPostIdsAtom = atom<Set<string>>(new Set<string>());

// Current user for feed context
export const currentUserAtom = atom<AuthUser | null>(null);

// Store the current Firestore unsubscribe function
const feedUnsubscribeAtom = atom<null | Unsubscribe>(null);

// Write-only atom to set up or tear down the real-time subscription
export const feedSubscriptionAtom = atom(
  null,
  (get, set) => {
    console.log("[Feed] Request to setup feed subscription...");

    // Check if subscription is already active
    const activeUnsubscribe = get(feedUnsubscribeAtom);
    if (activeUnsubscribe) {
      console.log("[Feed] Subscription already active. Skipping setup.");
      return;
    }

    const currentUserId = get(currentUserAtom)?.uid || null;
    console.log("[Feed] Starting new subscription. Current user ID:", currentUserId);

    set(feedLoadingAtom, true);

    const newUnsubscribe = subscribeToFeedPosts(
      (posts) => {
        console.log(`[Feed] Received posts update: ${posts.length} posts`);
        set(postsAtom, posts);
        set(feedErrorAtom, null);
        set(feedLoadingAtom, false);

        // Fetch likes separately (non-blocking)
        if (currentUserId && posts.length > 0) {
          // console.log("[Feed] Fetching liked post IDs...");
          getLikedPostIds(currentUserId, posts.map((p) => p.id))
            .then((ids) => {
              // console.log("[Feed] Liked post IDs fetched successfully");
              set(likedPostIdsAtom, new Set(ids));
            })
            .catch((err) => {
              console.error("[Feed] Error fetching liked post IDs:", err);
              set(likedPostIdsAtom, new Set<string>());
            });
        } else {
          set(likedPostIdsAtom, new Set<string>());
        }
      },
      (error) => {
        console.error("[Feed] Error in feed subscription:", error);
        set(feedErrorAtom, error);
        set(feedLoadingAtom, false);
      }
    );

    set(feedUnsubscribeAtom, newUnsubscribe);
  }
);

// --- Derived atoms ---
const sortByCreatedAt = (posts: FeedPost[]) =>
  [...posts].sort((a, b) => b.createdAt - a.createdAt);

export const explorePostsAtom = atom<FeedPost[]>((get) => {
  const allPosts = get(postsAtom);
  const likedPostIds = get(likedPostIdsAtom);

  const postsWithLikes = allPosts.map((post) => ({
    ...post,
    liked: likedPostIds.has(post.id),
  }));

  return sortByCreatedAt(postsWithLikes);
});

export const followingPostsAtom = atom<FeedPost[]>((get) => {
  const allPosts = get(postsAtom);
  const likedPostIds = get(likedPostIdsAtom);
  const currentUser = get(currentUserAtom);

  if (!currentUser) return [];

  const filtered = allPosts.filter(
    (post) => post.author.isFollowed || post.author.id === currentUser.uid
  );

  const postsWithLikes = filtered.map((post) => ({
    ...post,
    liked: likedPostIds.has(post.id),
  }));

  const sorted = sortByCreatedAt(postsWithLikes);
  sorted.sort(
    (a, b) =>
      Number(b.author.id === currentUser.uid) -
      Number(a.author.id === currentUser.uid)
  );
  return sorted;
});

import { collection, getDocs, query, where, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { FeedPost, FeedAuthor } from "../../types";

const POSTS_COLLECTION = "posts";
const USERS_COLLECTION = "users";
const ARTISTS_COLLECTION = "artists";

type PostDoc = {
  id: string;
  authorId: string;
  content: string;
  createdAt: any; // Firestore timestamp
  metrics: { likes: number; comments: number; shares: number };
  mediaUrl?: string; // Add optional mediaUrl
};

/**
 * Fetches posts for the feed and enriches them with author data from both artists and users collections.
 */
export const getFeedPosts = async (): Promise<FeedPost[]> => {
  try {
    const postQuery = query(
      collection(firestore, POSTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const postSnapshots = await getDocs(postQuery);
    const postsFromDB: PostDoc[] = postSnapshots.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PostDoc, "id">),
    }));

    if (postsFromDB.length === 0) {
      return [];
    }

    const authorIds = [...new Set(postsFromDB.map((post) => post.authorId))];
    const authorsMap = new Map<string, FeedAuthor>();

    if (authorIds.length > 0) {
      // First, try to find authors in the 'artists' collection
      const artistQuery = query(
        collection(firestore, ARTISTS_COLLECTION),
        where("__name__", "in", authorIds)
      );
      const artistSnapshots = await getDocs(artistQuery);
      artistSnapshots.forEach((doc) => {
        const data = doc.data();
        authorsMap.set(doc.id, {
          id: doc.id,
          name: data.name,
          handle: data.name.replace(/\s+/g, "").toLowerCase(),
          avatar: data.avatar,
          verified: data.verified || false,
        });
      });

      // Find which authors were not in the 'artists' collection
      const missingAuthorIds = authorIds.filter(id => !authorsMap.has(id));

      // If there are missing authors, look for them in the 'users' collection
      if (missingAuthorIds.length > 0) {
        const userQuery = query(
          collection(firestore, USERS_COLLECTION),
          where("uid", "in", missingAuthorIds) // Assuming 'uid' field exists in users collection
        );
        const userSnapshots = await getDocs(userQuery);
        userSnapshots.forEach((doc) => {
          const data = doc.data();
          authorsMap.set(data.uid, {
            id: data.uid,
            name: data.displayName,
            handle: data.displayName.replace(/\s+/g, "").toLowerCase(),
            avatar: data.photoURL,
            verified: false, // Regular users are not verified artists
          });
        });
      }
    }

    const feedPosts: FeedPost[] = postsFromDB.map((post) => {
      const author = authorsMap.get(post.authorId) || {
        id: post.authorId,
        name: "Unknown User",
        handle: "unknown",
      };
      const createdAtTimestamp = post.createdAt.toDate();
      
      return {
        id: post.id,
        author: author,
        content: post.content,
        createdAt: createdAtTimestamp.getTime(),
        relativeTime: "Just now",
        metrics: post.metrics || { likes: 0, comments: 0, shares: 0 },
        // Add the media object if mediaUrl exists
        media: post.mediaUrl ? { type: 'image', items: [{ uri: post.mediaUrl }] } : undefined,
      };
    });

    return feedPosts;
  } catch (error) {
    console.error("Error getting feed posts:", error);
    throw error;
  }
};

/**
 * Toggles the like status for a post, incrementing or decrementing the count.
 */
export const togglePostLike = async (postId: string, isCurrentlyLiked: boolean): Promise<void> => {
  if (!postId) return;
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  try {
    await updateDoc(postRef, {
      "metrics.likes": increment(isCurrentlyLiked ? -1 : 1),
    });
  } catch (error) {
    console.error("Failed to toggle post like:", error);
    throw error;
  }
};

/**
 * Creates a new text-only post in Firestore.
 */
export const createPost = async (postData: { authorId: string; content: string; mediaUrl?: string }): Promise<void> => {
  try {
    await addDoc(collection(firestore, POSTS_COLLECTION), {
      authorId: postData.authorId,
      content: postData.content,
      createdAt: serverTimestamp(),
      metrics: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      ...(postData.mediaUrl && { mediaUrl: postData.mediaUrl }), // Add mediaUrl if provided
      // Other fields like 'media' (detailed structure) can be added later
    });
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

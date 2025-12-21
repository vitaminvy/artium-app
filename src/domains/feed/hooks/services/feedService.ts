import { collection, getDocs, query, where, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp, writeBatch, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
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
 * Subscribes to feed posts and provides real-time updates.
 */
export const subscribeToFeedPosts = (
  onUpdate: (posts: FeedPost[]) => void,
  onError: (error: Error) => void,
  currentUserId: string | null
): Unsubscribe => {
  const postQuery = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(postQuery, async (querySnapshot) => {
    try {
      const postsFromDB: PostDoc[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PostDoc, "id">),
      }));

      if (postsFromDB.length === 0) {
        onUpdate([]);
        return;
      }

      const authorIds = [...new Set(postsFromDB.map((post) => post.authorId))];
      const authorsMap = new Map<string, FeedAuthor>();

      if (authorIds.length > 0) {
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

        const missingAuthorIds = authorIds.filter(id => !authorsMap.has(id));
        if (missingAuthorIds.length > 0) {
          const userQuery = query(
            collection(firestore, USERS_COLLECTION),
            where("uid", "in", missingAuthorIds)
          );
          const userSnapshots = await getDocs(userQuery);
          userSnapshots.forEach((doc) => {
            const data = doc.data();
            authorsMap.set(data.uid, {
              id: data.uid,
              name: data.displayName,
              handle: (data.displayName || '').replace(/\s+/g, "").toLowerCase(),
              avatar: data.photoURL,
              verified: false,
            });
          });
        }
      }

      const likedPostIds = new Set<string>();
      if (currentUserId && postsFromDB.length > 0) {
        const postIds = postsFromDB.map(post => post.id);
        const likeChecks = postIds.map(postId => 
          getDoc(doc(firestore, POSTS_COLLECTION, postId, "likes", currentUserId))
        );
        const likeSnapshots = await Promise.all(likeChecks);
        likeSnapshots.forEach((likeSnap, index) => {
          if (likeSnap.exists()) {
            likedPostIds.add(postIds[index]);
          }
        });
      }

      const feedPosts: FeedPost[] = postsFromDB.map((post) => {
        const author = authorsMap.get(post.authorId) || {
          id: post.authorId,
          name: "Unknown User",
          handle: "unknown",
        };
        const createdAtTimestamp = post.createdAt ? post.createdAt.toDate() : new Date();
        
        return {
          id: post.id,
          author: author,
          content: post.content,
          createdAt: createdAtTimestamp.getTime(),
          relativeTime: "Just now",
          metrics: post.metrics || { likes: 0, comments: 0, shares: 0 },
          media: post.mediaUrl ? { type: 'image', items: [{ uri: post.mediaUrl }], placeholderColor: '#CBD5E1', aspectRatio: 1 } : undefined,
          liked: likedPostIds.has(post.id),
        };
      });
      onUpdate(feedPosts);
    } catch (e: any) {
      onError(e);
    }
  });

  return unsubscribe;
};

/**
 * Toggles the like status for a post, incrementing or decrementing the count.
 */
export const togglePostLike = async (postId: string, userId: string, isCurrentlyLiked: boolean): Promise<void> => {
  if (!postId || !userId) return;

  const batch = writeBatch(firestore);
  
  // Reference to the main post document
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  
  // Reference to the user's "like" document in the subcollection
  const likeRef = doc(firestore, POSTS_COLLECTION, postId, "likes", userId);

  if (isCurrentlyLiked) {
    // User is UNLIKING: decrement counter and delete like document
    batch.update(postRef, { "metrics.likes": increment(-1) });
    batch.delete(likeRef);
  } else {
    // User is LIKING: increment counter and create like document
    batch.update(postRef, { "metrics.likes": increment(1) });
    batch.set(likeRef, { createdAt: serverTimestamp() });
  }

  try {
    await batch.commit();
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

/**
 * Adds a new comment to a post and increments the comment count on the post.
 */
export const addCommentToPost = async (
  postId: string,
  commentData: { authorId: string; content: string }
): Promise<void> => {
  const trimmed = commentData.content.trim();

  if (!postId || !commentData.authorId || !trimmed) {
    throw new Error("Post ID, author ID, and content are required to add a comment.");
  }

  const postRef = doc(firestore, POSTS_COLLECTION, postId);

  try {
    await addDoc(collection(postRef, "comments"), {
      authorId: commentData.authorId,
      content: trimmed,
      createdAt: serverTimestamp(),
    });

    await updateDoc(postRef, {
      "metrics.comments": increment(1),
    });
  } catch (error) {
    console.error("Failed to add comment:", error);
    throw error;
  }
};

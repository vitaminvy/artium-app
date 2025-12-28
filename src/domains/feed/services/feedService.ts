import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  limit,
  Timestamp,
  onSnapshot,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  getDoc,
  runTransaction
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { FeedPost, FeedComment } from "../types";

const mapQuote = (raw: any) => {
  if (!raw) return undefined;
  const toMillis = (value: any) => {
    if (!value) return undefined;
    if (value instanceof Timestamp) return value.toMillis();
    if (typeof value?.toDate === "function") return value.toDate().getTime();
    if (typeof value === "number") return value;
    return undefined;
  };
  return {
    ...raw,
    createdAt: toMillis(raw.createdAt) ?? raw.createdAt ?? Date.now(),
  };
};

const POSTS_COLLECTION = "posts";

export type PaginatedPostsResult = {
  posts: FeedPost[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
};

/**
 * Fetches a paginated list of posts.
 */
export const getFeedPosts = async (
  pageSize: number,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null,
  userId?: string
): Promise<PaginatedPostsResult> => {
  try {
    const q = lastVisible
      ? query(collection(firestore, POSTS_COLLECTION), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(pageSize))
      : query(collection(firestore, POSTS_COLLECTION), orderBy("createdAt", "desc"), limit(pageSize));

    const snapshot = await getDocs(q);
    const posts = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      let liked = false;

      if (userId) {
        try {
          const likeRef = doc(firestore, POSTS_COLLECTION, docSnapshot.id, "likes", userId);
          const likeSnap = await getDoc(likeRef);
          liked = likeSnap.exists();
        } catch (err) {
          console.warn(`Failed to check like status for post ${docSnapshot.id}`, err);
        }
      }

      return {
        id: docSnapshot.id,
        ...data,
        author: data.authorSnapshot,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
        quote: mapQuote(data.quote),
        liked,
      } as FeedPost;
    }));

    return {
      posts,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error getting feed posts:", error);
    throw error;
  }
};

/**
 * Subscribes to the like status of a specific post for a specific user.
 */
export const subscribeToPostLike = (
  postId: string,
  userId: string,
  onUpdate: (isLiked: boolean) => void
) => {
  const likeRef = doc(firestore, POSTS_COLLECTION, postId, "likes", userId);
  return onSnapshot(likeRef, (docSnapshot) => {
    onUpdate(docSnapshot.exists());
  }, (error) => {
    console.error(`Error subscribing to like for post ${postId}:`, error);
  });
};

/**
 * Subscribes to the feed posts in real-time.
 */
export const subscribeToFeedPosts = (
  pageSize: number,
  onUpdate: (posts: FeedPost[], lastVisible: QueryDocumentSnapshot<DocumentData> | null) => void,
  userId?: string
) => {
  const q = query(collection(firestore, POSTS_COLLECTION), orderBy("createdAt", "desc"), limit(pageSize));

  return onSnapshot(q, async (snapshot) => {
    const posts = snapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      // Liked status is now handled by individual components/subscriptions
      // We default to false here or undefined, the UI component will fetch the real status.
      return {
        id: docSnapshot.id,
        ...data,
        author: data.authorSnapshot,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
        quote: mapQuote(data.quote),
        liked: false, 
      } as FeedPost;
    });

    onUpdate(posts, snapshot.docs[snapshot.docs.length - 1] || null);
  }, (error) => {
    console.error("Error subscribing to feed posts:", error);
  });
};

/**
 * Toggle Like cho bài viết
 */
export const togglePostLike = async (
  postId: string,
  userId: string,
  _currentLikedStatus?: boolean
) => {
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  const likeRef = doc(postRef, "likes", userId);

  try {
    await runTransaction(firestore, async (transaction) => {
      const likeDoc = await transaction.get(likeRef);
      if (likeDoc.exists()) {
        transaction.delete(likeRef);
        transaction.update(postRef, { "metrics.likes": increment(-1) });
      } else {
        transaction.set(likeRef, { createdAt: serverTimestamp() });
        transaction.update(postRef, { "metrics.likes": increment(1) });
      }
    });
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
};


/**
 * Đăng bài viết mới (Moment)
 */
type CreatePostInput = {
  authorId: string;
  authorSnapshot: any;
  content: string;
  media?: any;
  quote?: any;
  isReshare?: boolean;
  resharedFrom?: any;
};

export const createPost = async (params: CreatePostInput) => {
  try {
    const docRef = await addDoc(collection(firestore, POSTS_COLLECTION), {
      authorId: params.authorId,
      authorSnapshot: params.authorSnapshot,
      content: params.content,
      media: params.media ?? null,
      quote: params.quote ?? null,
      isReshare: params.isReshare ?? false,
      resharedFrom: params.resharedFrom ?? null,
      metrics: { likes: 0, comments: 0, shares: 0 },
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

/**
 * Thêm comment mới
 */
export const addCommentToPost = async (postId: string, params: { authorSnapshot: any, content: string }) => {
  const commentsRef = collection(firestore, POSTS_COLLECTION, postId, "comments");
  const postRef = doc(firestore, POSTS_COLLECTION, postId);

  try {
    await addDoc(commentsRef, {
      author: params.authorSnapshot,
      content: params.content,
      createdAt: serverTimestamp(),
    });
    await updateDoc(postRef, { "metrics.comments": increment(1) });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

/**
 * Subscribes to the comments of a specific post.
 */
export const subscribeToPostComments = (
  postId: string,
  onUpdate: (comments: FeedComment[]) => void
) => {
  const commentsRef = collection(firestore, POSTS_COLLECTION, postId, "comments");
  // Order by createdAt descending (newest on top) or ascending depending on UI.
  // Usually comments are Oldest first or Newest first?
  // Let's go with Newest first for now as per "Be the first..." usually implying top.
  const q = query(commentsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      } as FeedComment;
    });
    onUpdate(comments);
  }, (error) => {
    console.error(`Error subscribing to comments for post ${postId}:`, error);
  });
};

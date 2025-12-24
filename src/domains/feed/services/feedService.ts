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
  getDoc
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { FeedPost, FeedComment } from "../types";

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
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedPostsResult> => {
  try {
    const q = lastVisible
      ? query(collection(firestore, POSTS_COLLECTION), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(pageSize))
      : query(collection(firestore, POSTS_COLLECTION), orderBy("createdAt", "desc"), limit(pageSize));

    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        author: data.authorSnapshot,
        createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
      } as FeedPost;
    });

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
 * Toggle Like cho bài viết
 */
export const togglePostLike = async (postId: string, userId: string) => {
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  const likeRef = doc(postRef, "likes", userId);

  const likeDoc = await getDoc(likeRef);
  
  try {
    if (likeDoc.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { "metrics.likes": increment(-1) });
    } else {
      await setDoc(likeRef, { createdAt: serverTimestamp() });
      await updateDoc(postRef, { "metrics.likes": increment(1) });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
};


/**
 * Đăng bài viết mới (Moment)
 */
export const createPost = async (params: { authorId: string, authorSnapshot: any, content: string, media?: any }) => {
  try {
    const docRef = await addDoc(collection(firestore, POSTS_COLLECTION), {
      authorId: params.authorId,
      authorSnapshot: params.authorSnapshot,
      content: params.content,
      media: params.media,
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


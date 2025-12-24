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
  getDoc,
  where,
  limit,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { FeedPost, FeedComment } from "../types";

const POSTS_COLLECTION = "posts";

/**
 * Lắng nghe thay đổi bảng tin Real-time
 */
export const subscribeToFeedPosts = (
  onUpdate: (posts: FeedPost[]) => void,
  onError: (error: Error) => void,
  currentUserId: string | null
) => {
  const q = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const posts = await Promise.all(snapshot.docs.map(async (postDoc) => {
        const data = postDoc.data();
        
        // Kiểm tra xem user hiện tại đã like bài này chưa
        let liked = false;
        if (currentUserId) {
          const likeDoc = await getDoc(doc(firestore, POSTS_COLLECTION, postDoc.id, "likes", currentUserId));
          liked = likeDoc.exists();
        }

        return {
          id: postDoc.id,
          ...data,
          author: data.authorSnapshot, // Map snapshot to UI author
          liked,
          createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(),
        } as FeedPost;
      }));
      onUpdate(posts);
    } catch (err: any) {
      onError(err);
    }
  }, (err) => onError(err));
};

/**
 * Toggle Like cho bài viết
 */
export const togglePostLike = async (postId: string, userId: string, isCurrentlyLiked: boolean) => {
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  const likeRef = doc(postRef, "likes", userId);

  try {
    if (isCurrentlyLiked) {
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


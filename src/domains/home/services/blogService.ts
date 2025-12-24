import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { firestore, } from "@/configs/firebase";
import { HomeBlogItem, HomeNewsItem } from "../types";

const EDITORIALS_COLLECTION = "editorials";

/**
 * Fetches the latest blog posts from the 'editorials' collection.
 */
export const getLatestBlogs = async (count: number = 10): Promise<HomeBlogItem[]> => {
  try {
    const blogsQuery = query(
      collection(firestore, EDITORIALS_COLLECTION),
      orderBy("publishedAt", "desc"),
      limit(count)
    );

    const snapshot = await getDocs(blogsQuery);
    const blogs = snapshot.docs.map((doc) => {
      const data = doc.data();
      const publishedAt = (data.publishedAt as Timestamp).toDate();
      
      return {
        id: doc.id,
        title: data.title,
        author: data.authorName,
        dateLabel: publishedAt.toLocaleDateString("en-US", {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        image: data.coverImage,
        authorAvatar: `https://i.pravatar.cc/150?u=${data.authorName}`, // Placeholder avatar based on name
      } as HomeBlogItem;
    });

    return blogs;
  } catch (error) {
    console.error("Error getting latest blogs:", error);
    // In a real app, you might want to log this to a monitoring service
    return []; // Return empty array on error to prevent UI crash
  }
};

/**
 * Fetches a single blog post by its ID.
 */
export const getBlogById = async (id: string): Promise<HomeBlogItem | null> => {
  try {
    const docRef = doc(firestore, EDITORIALS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.warn(`Blog post with ID ${id} not found.`);
      return null;
    }

    const data = docSnap.data();
    const publishedAt = (data.publishedAt as Timestamp).toDate();

    return {
      id: docSnap.id,
      title: data.title,
      excerpt: data.excerpt, // Make sure excerpt is included
      author: data.authorName,
      dateLabel: publishedAt.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      image: data.coverImage,
      authorAvatar: `https://i.pravatar.cc/150?u=${data.authorName}`,
    };
  } catch (error) {
    console.error(`Error getting blog post by ID (${id}):`, error);
    throw error;
  }
};

/**
 * Fetches the oldest editorials to be featured as "News".
 */
export const getOldestEditorialsAsNews = async (count: number = 5): Promise<HomeNewsItem[]> => {
  try {
    const newsQuery = query(
      collection(firestore, EDITORIALS_COLLECTION),
      orderBy("publishedAt", "asc"), // "asc" to get the oldest
      limit(count)
    );

    const snapshot = await getDocs(newsQuery);
    const news = snapshot.docs.map((doc) => {
      const data = doc.data();
      const publishedAt = (data.publishedAt as Timestamp).toDate();
      
      return {
        id: doc.id,
        title: data.title,
        dateLabel: publishedAt.toLocaleDateString("en-US", {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        image: data.coverImage,
        tag: "NEWS",
      } as HomeNewsItem;
    });

    return news;
  } catch (error) {
    console.error("Error getting oldest editorials for news:", error);
    return [];
  }
};

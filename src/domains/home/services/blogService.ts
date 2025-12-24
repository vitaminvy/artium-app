import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
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

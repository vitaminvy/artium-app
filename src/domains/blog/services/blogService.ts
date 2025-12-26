import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import type { BlogArticle, BlogListingData, BlogArticleWithMeta } from "../types";
import { blogMockData } from "../mockData";

const COLLECTION = "editorials";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80";

export type BlogPageResult = {
  items: BlogArticleWithMeta[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

export const formatPublishedDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const mapDocToBlog = (docSnap: DocumentSnapshot<DocumentData>): BlogArticleWithMeta => {
  const data = docSnap.data();
  const published = data.publishedAt?.toDate ? data.publishedAt.toDate() : new Date(data.publishedAt ?? Date.now());
  const authorName = data.authorName ?? "Unknown";

  return {
    id: docSnap.id,
    title: data.title ?? "Untitled",
    coverImage: data.coverImage ?? FALLBACK_IMAGE,
    excerpt: data.excerpt ?? "",
    authorName,
    authorAvatar:
      data.authorAvatar ??
      `https://i.pravatar.cc/150?u=${encodeURIComponent(authorName)}`,
    publishedAt: published.toISOString(),
    readTimeMinutes: data.readTimeMinutes ?? 5,
    tag: data.tag ?? "Blog",
    category: data.category,
    content: data.content ?? [],
    publishedLabel: formatPublishedDate(published.toISOString()),
  };
};

export const fetchBlogPage = async (
  pageSize: number,
  cursor: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<BlogPageResult> => {
  const q = cursor
    ? query(
        collection(firestore, COLLECTION),
        orderBy("publishedAt", "desc"),
        startAfter(cursor),
        limit(pageSize)
      )
    : query(
        collection(firestore, COLLECTION),
        orderBy("publishedAt", "desc"),
        limit(pageSize)
      );

  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(mapDocToBlog);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
  return {
    items,
    lastDoc,
    hasMore: items.length === pageSize,
  };
};

export const getBlogListing = async (pageSize: number = 15): Promise<BlogListingData> => {
  try {
    const { items } = await fetchBlogPage(pageSize);
    const featured = items.slice(0, 4);
    const latest = items.slice(0, 8);
    const popular = items.slice(2, 10).length ? items.slice(2, 10) : items.slice(0, 8);

    return {
      featured,
      latest,
      popular,
      all: items,
    };
  } catch (error) {
    console.error("Failed to fetch blogs, using mock data", error);
    const sorted = [...blogMockData.all].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const toWithMeta = sorted.map((item) => ({
      ...item,
      publishedLabel: formatPublishedDate(item.publishedAt),
    }));
    return {
      featured: toWithMeta.slice(0, 4),
      latest: toWithMeta.slice(0, 8),
      popular: toWithMeta.slice(2, 10),
      all: toWithMeta,
    };
  }
};

export const getBlogById = async (id: string): Promise<BlogArticleWithMeta | null> => {
  try {
    const docRef = doc(firestore, COLLECTION, id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return mapDocToBlog(snap as QueryDocumentSnapshot<DocumentData>);
  } catch (error) {
    console.error("Failed to fetch blog by id, using mock", error);
    const match = blogMockData.all.find((item) => item.id === id);
    return match
      ? {
          ...match,
          publishedLabel: formatPublishedDate(match.publishedAt),
        }
      : null;
  }
};

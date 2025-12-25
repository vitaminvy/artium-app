import type { BlogArticle, BlogListingData, BlogArticleWithMeta } from "../types";
import { blogMockData } from "../mockData";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const sortByPublishedDate = (items: BlogArticle[]) =>
  [...items].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

const attachHelpers = (article: BlogArticle): BlogArticleWithMeta => ({
  ...article,
  publishedLabel: formatDate(article.publishedAt),
});

export const getBlogListing = async (): Promise<BlogListingData> => {
  // Mocked fetch to keep UI development fast; replace with Firestore call later.
  const result: BlogListingData = {
    featured: sortByPublishedDate(blogMockData.featured),
    latest: sortByPublishedDate(blogMockData.latest),
    popular: blogMockData.popular,
    all: sortByPublishedDate(blogMockData.all),
  };

  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 240);
  });
};

export const getBlogById = async (id: string): Promise<BlogArticleWithMeta | null> => {
  const match = blogMockData.all.find((item) => item.id === id);

  return new Promise((resolve) => {
    setTimeout(() => resolve(match ? attachHelpers(match) : null), 180);
  });
};

export const formatPublishedDate = formatDate;

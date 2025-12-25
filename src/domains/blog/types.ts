export type BlogArticle = {
  id: string;
  title: string;
  coverImage: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  publishedAt: string; // ISO string
  readTimeMinutes: number;
  tag?: string;
  category?: string;
  content?: string[];
};

export type BlogArticleWithMeta = BlogArticle & {
  publishedLabel: string;
};

export type BlogListingData = {
  featured: BlogArticle[];
  latest: BlogArticle[];
  popular: BlogArticle[];
  all: BlogArticle[];
};

import { useEffect, useState, useCallback, useMemo } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { fetchBlogPage } from "../services/blogService";
import type { BlogArticleWithMeta } from "../types";

const PAGE_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function useBlogData() {
  const [all, setAll] = useState<BlogArticleWithMeta[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const latest = useMemo(() => all.slice(0, 5), [all]);
  const popular = useMemo(() => {
    const sortedAsc = [...all].sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
    return sortedAsc.slice(0, 5);
  }, [all]);
  const featured = useMemo(() => {
    const excludeIds = new Set<string>([
      ...latest.map((i) => i.id),
      ...popular.map((i) => i.id),
    ]);
    const preferredPool = all.filter((item) => !excludeIds.has(item.id));
    const picks: BlogArticleWithMeta[] = shuffle(preferredPool).slice(0, 5);

    if (picks.length < 5) {
      const remaining = all.filter(
        (item) => !picks.find((p) => p.id === item.id)
      );
      picks.push(...shuffle(remaining).slice(0, 5 - picks.length));
    }

    return picks;
  }, [all, latest, popular]);

  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { items, lastDoc: cursor, hasMore: more } = await fetchBlogPage(PAGE_SIZE);
      setAll(items);
      setLastDoc(cursor);
      setHasMore(more);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error("Failed to fetch blogs"));
      setAll([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const { items, lastDoc: cursor, hasMore: more } = await fetchBlogPage(PAGE_SIZE, lastDoc);
      setAll((prev) => [...prev, ...items]);
      setLastDoc(cursor);
      setHasMore(more);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error("Failed to load more blogs"));
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, lastDoc]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    featured,
    latest,
    popular,
    all,
    hasMore,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
  };
}

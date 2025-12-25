import { useEffect, useState, useCallback } from "react";
import { getBlogListing } from "../services/blogService";
import type { BlogListingData } from "../types";

export function useBlogData() {
  const [data, setData] = useState<BlogListingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getBlogListing();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch blogs"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchBlogs,
  };
}

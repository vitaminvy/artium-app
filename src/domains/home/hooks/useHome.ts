import { useState, useEffect, useMemo } from "react";
import { homeMockData } from "../mockData";
import { HOME_CONSTANTS } from "../constants";
import { getLatestBlogs, getOldestEditorialsAsNews } from "../services/blogService";
import type { HomeBlogItem, HomeNewsItem } from "../types";

/**
 * Hook for home screen data.
 * Fetches real blog and news data, and uses mock data for other sections.
 */
export function useHome() {
  const [blogs, setBlogs] = useState<HomeBlogItem[]>([]);
  const [news, setNews] = useState<HomeNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch real data for blogs and news in parallel
        const [fetchedBlogs, fetchedNews] = await Promise.all([
          getLatestBlogs(),
          getOldestEditorialsAsNews(),
        ]);
        setBlogs(fetchedBlogs);
        setNews(fetchedNews);
      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Continue using mock data for other sections for now
  const events = useMemo(() => homeMockData.events, []);
  const sellItems = useMemo(() => homeMockData.sellItems, []);
  const sellItemsPreview = useMemo(
    () => homeMockData.sellItems.slice(0, HOME_CONSTANTS.SELL_ITEMS_PREVIEW_COUNT),
    []
  );
  const popularArtists = useMemo(() => homeMockData.following, []);
  const following = useMemo(
    () => homeMockData.following.slice(0, HOME_CONSTANTS.FOLLOWING_PREVIEW_COUNT),
    []
  );

  return {
    news,
    blogs,
    events,
    sellItems,
    following,
    popularArtists,
    sellItemsPreview,
    isLoading, // Expose loading state for UI
    error,     // Expose error state for UI
  };
}

/*
// READY FOR API INTEGRATION
// Uncomment this code when backend is ready:

import { useState, useEffect } from "react";
import type { HomeData } from "../types";

type UseHomeWithAPIReturn = {
  data: HomeData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  // Backward compatible selectors
  news: HomeData["news"];
  blogs: HomeData["blogs"];
  events: HomeData["events"];
  sellItems: HomeData["sellItems"];
  sellItemsPreview: HomeData["sellItems"];
  following: HomeData["following"];
  popularArtists: HomeData["following"];
};

export function useHomeWithAPI(): UseHomeWithAPIReturn {
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await homeService.getHomeData();
      // setData(response);

      await new Promise((resolve) => setTimeout(resolve, 100));
      setData(homeMockData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch home data"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const news = useMemo(() => data?.news ?? [], [data]);
  const blogs = useMemo(() => data?.blogs ?? [], [data]);
  const events = useMemo(() => data?.events ?? [], [data]);
  const sellItems = useMemo(() => data?.sellItems ?? [], [data]);
  const sellItemsPreview = useMemo(
    () => data?.sellItems.slice(0, HOME_CONSTANTS.SELL_ITEMS_PREVIEW_COUNT) ?? [],
    [data]
  );
  const popularArtists = useMemo(() => data?.following ?? [], [data]);
  const following = useMemo(
    () => data?.following.slice(0, HOME_CONSTANTS.FOLLOWING_PREVIEW_COUNT) ?? [],
    [data]
  );

  return {
    data,
    isLoading,
    error,
    refetch: fetchHomeData,
    // Backward compatible fields
    news,
    blogs,
    events,
    sellItems,
    sellItemsPreview,
    following,
    popularArtists,
  };
}
*/

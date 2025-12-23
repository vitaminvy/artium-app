import { useMemo } from "react";
import { homeMockData } from "../mockData";

export function useHome() {
  const news = useMemo(() => homeMockData.news, []);
  const blogs = useMemo(() => homeMockData.blogs, []);
  const events = useMemo(() => homeMockData.events, []);
  const sellItems = useMemo(() => homeMockData.sellItems, []);
  const sellItemsPreview = useMemo(() => homeMockData.sellItems.slice(0, 4), []);
  const popularArtists = useMemo(() => homeMockData.following, []);
  const following = useMemo(() => homeMockData.following.slice(0, 6), []);

  return {
    news,
    blogs,
    events,
    sellItems,
    following,
    popularArtists,
    sellItemsPreview,
  };
}

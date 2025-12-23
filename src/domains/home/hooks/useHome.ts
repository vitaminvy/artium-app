import { useMemo } from "react";
import { homeMockData } from "../mockData";

export function useHome() {
  const news = useMemo(() => homeMockData.news, []);
  const blogs = useMemo(() => homeMockData.blogs, []);
  const events = useMemo(() => homeMockData.events, []);
  const sellItems = useMemo(() => homeMockData.sellItems, []);
  const following = useMemo(() => homeMockData.following, []);

  return {
    news,
    blogs,
    events,
    sellItems,
    following,
  };
}

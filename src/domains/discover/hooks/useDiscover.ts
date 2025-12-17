import { useEffect, useState } from "react";
import { getArtworks, getTrendingArtworks } from "../../artwork/services/artworkService"; // IMPORT BOTH SERVICES
import {
  DiscoverTab,
  EventItem,
  ArtistProfile,
  Artwork,
} from "../types";
import { defaultDiscoverTab, discoverMockData } from "../mockData";

type UseDiscoverResult = {
  tab: DiscoverTab;
  setTab: (tab: DiscoverTab) => void;
  loading: boolean; // Add loading state
  error: Error | null; // Add error state
  topPicks: Artwork[];
  artworks: Artwork[];
  profiles: ArtistProfile[];
  moments: Artwork[];
  events: EventItem[];
};

export function useDiscover(): UseDiscoverResult {
  const [tab, setTab] = useState<DiscoverTab>(defaultDiscoverTab);
  
  // --- STATE MANAGEMENT FOR ALL ARTWORK FETCHING ---
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [topPicks, setTopPicks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllArtworks = async () => {
      try {
        setLoading(true);
        // Fetch trending and all artworks in parallel
        const [trending, all] = await Promise.all([
          getTrendingArtworks(),
          getArtworks()
        ]);
        setTopPicks(trending);
        setArtworks(all);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllArtworks();
  }, []); // Run once on mount

  // Keep mock data for other sections for now
  const moments = discoverMockData.moments;
  const profiles = discoverMockData.profiles;
  const events = discoverMockData.events;

  return {
    tab,
    setTab,
    loading,
    error,
    topPicks,
    artworks,
    profiles,
    moments,
    events,
  };
}

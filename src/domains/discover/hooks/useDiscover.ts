import { useEffect, useMemo, useState } from "react";
import { getArtworks } from "../../artwork/services/artworkService"; // IMPORT OUR NEW SERVICE
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
  
  // --- NEW STATE MANAGEMENT FOR ARTWORKS ---
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const fetchedArtworks = await getArtworks();
        setArtworks(fetchedArtworks);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []); // Run once on mount

  // Keep mock data for other sections for now
  const topPicks = useMemo(() => artworks.slice(0, 6), [artworks]); // Base topPicks on real data
  const moments = useMemo(() => discoverMockData.moments, []);
  const profiles = useMemo(() => discoverMockData.profiles, []);
  const events = useMemo(() => discoverMockData.events, []);

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

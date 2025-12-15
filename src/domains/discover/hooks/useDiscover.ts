import { useMemo, useState } from "react";

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
  topPicks: Artwork[];
  artworks: Artwork[];
  profiles: ArtistProfile[];
  moments: Artwork[];
  events: EventItem[];
};

export function useDiscover(): UseDiscoverResult {
  const [tab, setTab] = useState<DiscoverTab>(defaultDiscoverTab);

  const topPicks = useMemo(() => discoverMockData.artworks.slice(0, 6), []);

  const artworks = useMemo(() => {
    if (tab === "moments") return discoverMockData.moments;
    return discoverMockData.artworks;
  }, [tab]);

  const moments = useMemo(() => discoverMockData.moments, []);

  const profiles = useMemo(() => discoverMockData.profiles, []);

  const events = useMemo(() => discoverMockData.events, []);

  return {
    tab,
    setTab,
    topPicks,
    artworks,
    profiles,
    moments,
    events,
  };
}

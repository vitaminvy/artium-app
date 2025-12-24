import { useEffect, useState, useCallback } from "react";
import { collection, getDocs, query, orderBy, limit, where, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { getArtworks, getTrendingArtworks } from "../../artwork/services/artworkService";
import {
  DiscoverTab,
  EventItem,
  ArtistProfile,
  Artwork,
} from "../types";
import { defaultDiscoverTab, discoverMockData } from "../mockData";

const ARTWORK_PAGE_SIZE = 6;
const MOMENT_PAGE_SIZE = 3;

type UseDiscoverResult = {
  tab: DiscoverTab;
  setTab: (tab: DiscoverTab) => void;
  loading: boolean;
  error: Error | null;
  
  topPicks: Artwork[];
  
  artworks: Artwork[];
  loadMoreArtworks: () => void;
  isMoreArtworksLoading: boolean;
  hasMoreArtworks: boolean;

  moments: Artwork[];
  loadMoreMoments: () => void;
  isMoreMomentsLoading: boolean;
  hasMoreMoments: boolean;

  profiles: ArtistProfile[];
  events: EventItem[];
};

export function useDiscover(): UseDiscoverResult {
  const [tab, setTab] = useState<DiscoverTab>(defaultDiscoverTab);
  
  // --- Artworks State ---
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [topPicks, setTopPicks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastArtworkDoc, setLastArtworkDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreArtworks, setHasMoreArtworks] = useState(true);
  const [isMoreArtworksLoading, setIsMoreArtworksLoading] = useState(false);

  // --- Moments State ---
  const [moments, setMoments] = useState<Artwork[]>([]);
  const [lastMomentDoc, setLastMomentDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreMoments, setHasMoreMoments] = useState(true);
  const [isMoreMomentsLoading, setIsMoreMomentsLoading] = useState(false);

  const fetchInitialArtworks = useCallback(async () => {
    try {
      setLoading(true);
      const [trendingArtworks, initialArtworksResult] = await Promise.all([
        getTrendingArtworks(),
        getArtworks(ARTWORK_PAGE_SIZE, null),
      ]);
      setTopPicks(trendingArtworks);
      setArtworks(initialArtworksResult.artworks);
      setLastArtworkDoc(initialArtworksResult.lastVisible);
      setHasMoreArtworks(initialArtworksResult.artworks.length === ARTWORK_PAGE_SIZE);
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMoreArtworks = useCallback(async () => {
    if (isMoreArtworksLoading || !hasMoreArtworks) return;
    setIsMoreArtworksLoading(true);
    try {
      const { artworks: newArtworks, lastVisible } = await getArtworks(ARTWORK_PAGE_SIZE, lastArtworkDoc);
      setArtworks(prev => [...prev, ...newArtworks]);
      setLastArtworkDoc(lastVisible);
      setHasMoreArtworks(newArtworks.length === ARTWORK_PAGE_SIZE);
    } catch (e: any) {
      setError(e);
    } finally {
      setIsMoreArtworksLoading(false);
    }
  }, [isMoreArtworksLoading, hasMoreArtworks, lastArtworkDoc]);

  // --- Moments Fetching ---
  const fetchMoments = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    try {
      const q = lastDoc 
        ? query(collection(firestore, "posts"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(MOMENT_PAGE_SIZE))
        : query(collection(firestore, "posts"), orderBy("createdAt", "desc"), limit(MOMENT_PAGE_SIZE));

      const snapshot = await getDocs(q);
      const newMoments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.content || "Untitled Moment",
          artist: data.authorSnapshot?.name || "Unknown",
          artistAvatar: data.authorSnapshot?.avatar,
          image: data.media?.items?.[0]?.uri || "https://via.placeholder.com/300",
        } as Artwork;
      });
      
      setHasMoreMoments(newMoments.length === MOMENT_PAGE_SIZE);
      setLastMomentDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      return newMoments;
    } catch (e: any) {
      setError(e);
      return [];
    }
  }, []);

  const loadMoreMoments = useCallback(async () => {
    if (isMoreMomentsLoading || !hasMoreMoments) return;
    setIsMoreMomentsLoading(true);
    const newMoments = await fetchMoments(lastMomentDoc);
    setMoments(prev => [...prev, ...newMoments]);
    setIsMoreMomentsLoading(false);
  }, [isMoreMomentsLoading, hasMoreMoments, lastMomentDoc, fetchMoments]);


  useEffect(() => {
    fetchInitialArtworks();
    fetchMoments(null).then(initialMoments => setMoments(initialMoments));
  }, [fetchInitialArtworks, fetchMoments]);

  // Keep mock data for other sections
  const profiles = discoverMockData.profiles;
  const events = discoverMockData.events;

  return {
    tab,
    setTab,
    loading,
    error,
    topPicks,
    artworks,
    loadMoreArtworks,
    isMoreArtworksLoading,
    hasMoreArtworks,
    moments,
    loadMoreMoments,
    isMoreMomentsLoading,
    hasMoreMoments,
    profiles,
    events,
  };
}

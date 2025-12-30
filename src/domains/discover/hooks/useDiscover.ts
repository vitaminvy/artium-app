import { useEffect, useState, useCallback, useRef } from "react";
import { collection, getDocs, query, orderBy, limit, where, startAfter, QueryDocumentSnapshot, DocumentData, Timestamp } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { getArtworks, getTrendingArtworks } from "../../artwork/services/artworkService";
import {
  DiscoverTab,
  EventItem,
  ArtistProfile,
  Artwork,
  DiscoverMoment,
} from "../types";
import type { MomentCardItem } from "../../user/components/profile/MomentCard";
import type { FeedPost, FeedMedia, FeedMetrics, FeedAuthor } from "../../feed/types";
import { defaultDiscoverTab, discoverMockData } from "../mockData";

import { getEvents, fetchUserRsvps } from "../services/eventService";
import { useAuth } from "@/domains/auth/contexts/AuthContext";

const ARTWORK_PAGE_SIZE = 6;
const MOMENT_PAGE_SIZE = 3;
const PROFILE_PAGE_SIZE = 10;
const EVENT_PAGE_SIZE = 3;

const adaptEvent = (ev: any): EventItem => {
  const date =
    ev.startDate instanceof Date ? ev.startDate : new Date(ev.startDate ?? ev.datetime);
  return {
    ...ev,
    // UI expects `datetime` as ISO string
    datetime: date.toISOString(),
    // Keep original startDate if other screens rely on it
    startDate: date.toISOString(),
  };
};

const formatTimeAgo = (createdAt: number) => {
  const diff = Date.now() - createdAt;
  const minutes = Math.floor(diff / 60000);
  if (minutes <= 0) return "Just now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const mapMomentDoc = (doc: QueryDocumentSnapshot<DocumentData>): DiscoverMoment => {
  const data = doc.data();
  const createdAtMs =
    (data.createdAt as Timestamp | undefined)?.toMillis?.() ?? Date.now();
  const metrics: FeedMetrics = data.metrics ?? { likes: 0, comments: 0, shares: 0 };
  const media: FeedMedia | undefined = data.media ?? undefined;
  const authorSnapshot: FeedAuthor = {
    id: data.authorSnapshot?.id ?? data.authorId ?? "unknown",
    name: data.authorSnapshot?.name ?? "Unknown",
    handle:
      data.authorSnapshot?.handle ??
      (data.authorSnapshot?.name
        ? data.authorSnapshot.name.replace(/\s+/g, "").toLowerCase()
        : "user"),
    avatar: data.authorSnapshot?.avatar,
    verified: data.authorSnapshot?.verified ?? false,
  };

  const card: MomentCardItem = {
    id: doc.id,
    author: authorSnapshot,
    title: (data.media?.title as string | undefined) ?? undefined,
    content: data.content ?? "Untitled Moment",
    media: media,
    metrics,
    liked: data.liked ?? false,
    relativeTime: formatTimeAgo(createdAtMs),
  };

  const post: FeedPost = {
    id: doc.id,
    author: authorSnapshot,
    content: data.content ?? "",
    createdAt: createdAtMs,
    media: media,
    metrics,
    liked: data.liked ?? false,
    reshared: data.reshared ?? false,
    isReshare: data.isReshare ?? false,
    resharedFrom: data.resharedFrom,
    quote: data.quote,
    relativeTime: formatTimeAgo(createdAtMs),
  };

  return {
    id: doc.id,
    card,
    post,
  };
};

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
  refreshArtworks: () => Promise<void>;
  moments: DiscoverMoment[];
  loadMoreMoments: () => void;
  isMoreMomentsLoading: boolean;
  hasMoreMoments: boolean;
  profiles: ArtistProfile[];
  loadMoreProfiles: () => void;
  isMoreProfilesLoading: boolean;
  hasMoreProfiles: boolean;
  events: EventItem[];
  loadMoreEvents: () => void;
  isMoreEventsLoading: boolean;
  hasMoreEvents: boolean;
  updateEventRsvp: (eventId: string, rsvpStatus: "none" | "going" | "maybe" | "notGoing") => void;
};

export function useDiscover(): UseDiscoverResult {
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<DiscoverTab>(defaultDiscoverTab);

  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [topPicks, setTopPicks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastArtworkDoc, setLastArtworkDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreArtworks, setHasMoreArtworks] = useState(true);
  const [isMoreArtworksLoading, setIsMoreArtworksLoading] = useState(false);

  const [moments, setMoments] = useState<DiscoverMoment[]>([]);
  const [lastMomentDoc, setLastMomentDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreMoments, setHasMoreMoments] = useState(true);
  const [isMoreMomentsLoading, setIsMoreMomentsLoading] = useState(false);

  const [profiles, setProfiles] = useState<ArtistProfile[]>([]);
  const [lastProfileDoc, setLastProfileDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreProfiles, setHasMoreProfiles] = useState(true);
  const [isMoreProfilesLoading, setIsMoreProfilesLoading] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [lastEventDoc, setLastEventDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [isMoreEventsLoading, setIsMoreEventsLoading] = useState(false);

  // Store RSVP status map
  const [rsvpMap, setRsvpMap] = useState<Record<string, "going" | "maybe" | "notGoing">>({});
  const rsvpMapRef = useRef(rsvpMap);

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

  const refreshArtworks = useCallback(async () => {
    try {
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
    }
  }, []);

  const fetchMoments = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    try {
      const q = lastDoc 
        ? query(collection(firestore, "posts"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(MOMENT_PAGE_SIZE))
        : query(collection(firestore, "posts"), orderBy("createdAt", "desc"), limit(MOMENT_PAGE_SIZE));

        const snapshot = await getDocs(q);
        const newMoments = snapshot.docs.map(mapMomentDoc);

        setHasMoreMoments(newMoments.length === MOMENT_PAGE_SIZE);
        setLastMomentDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        return newMoments;
      } catch (e: any) {
        setError(e);
        return [];
      }
    },
    []
  );

  const loadMoreMoments = useCallback(async () => {
    if (isMoreMomentsLoading || !hasMoreMoments) return;
    setIsMoreMomentsLoading(true);
    const newMoments = await fetchMoments(lastMomentDoc);
    setMoments(prev => [...prev, ...newMoments]);
    setIsMoreMomentsLoading(false);
  }, [isMoreMomentsLoading, hasMoreMoments, lastMomentDoc, fetchMoments]);

  const fetchArtists = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    try {
      const artistsQuery = lastDoc
        ? query(collection(firestore, "users"), where("roles.isArtist", "==", true), orderBy("displayName"), startAfter(lastDoc), limit(PROFILE_PAGE_SIZE))
        : query(collection(firestore, "users"), where("roles.isArtist", "==", true), orderBy("displayName"), limit(PROFILE_PAGE_SIZE));
      
      const snapshot = await getDocs(artistsQuery);
      const artistProfiles = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.displayName,
          avatar: data.avatarUri || data.avatar || data.photoURL || "",
          location: "From Firestore",
          artworks: [],
        } as ArtistProfile;
      });

      setHasMoreProfiles(artistProfiles.length === PROFILE_PAGE_SIZE);
      setLastProfileDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      return artistProfiles;
    } catch(e: any) {
      console.error("Failed to fetch artists:", e);
      setError(e);
      return [];
    }
  }, []);

  const loadMoreProfiles = useCallback(async () => {
    if (isMoreProfilesLoading || !hasMoreProfiles) return;
    setIsMoreProfilesLoading(true);
    const newProfiles = await fetchArtists(lastProfileDoc);
    setProfiles(prev => [...prev, ...newProfiles]);
    setIsMoreProfilesLoading(false);
  }, [isMoreProfilesLoading, hasMoreProfiles, lastProfileDoc, fetchArtists]);

  const fetchEvents = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
    try {
      // console.log("[useDiscover] Fetching events from Firestore...");
      const { events: newEvents, lastVisible } = await getEvents(EVENT_PAGE_SIZE, lastDoc);
      // console.log("[useDiscover] Fetched events count:", newEvents.length);
      const mapped = newEvents.map(adaptEvent);
      const rsvpSnapshot = rsvpMapRef.current;

      // Merge with RSVP status
      const eventsWithRsvp = mapped.map(event => ({
        ...event,
        rsvpStatus: rsvpSnapshot[event.id] ?? "none"
      }));

      setHasMoreEvents(mapped.length === EVENT_PAGE_SIZE);
      setLastEventDoc(lastVisible);
      return eventsWithRsvp;
    } catch (e: any) {
      console.error("Failed to fetch events:", e);
      setError(e);
      return [];
    }
  }, []);

  const loadMoreEvents = useCallback(async () => {
    if (isMoreEventsLoading || !hasMoreEvents) return;
    setIsMoreEventsLoading(true);
    const newEvents = await fetchEvents(lastEventDoc);
    setEvents(prev => [...prev, ...newEvents]);
    setIsMoreEventsLoading(false);
  }, [isMoreEventsLoading, hasMoreEvents, lastEventDoc, fetchEvents]);

  const updateEventRsvp = useCallback((eventId: string, rsvpStatus: "none" | "going" | "maybe" | "notGoing") => {
    // Update rsvpMap
    setRsvpMap(prev => ({
      ...prev,
      [eventId]: rsvpStatus as "going" | "maybe" | "notGoing"
    }));

    // Update events list
    setEvents(prev =>
      prev.map(event =>
        event.id === eventId
          ? { ...event, rsvpStatus }
          : event
      )
    );
  }, []);

  // Fetch user RSVPs when user is authenticated
  useEffect(() => {
    const loadUserRsvps = async () => {
      if (currentUser?.uid) {
        // console.log("[useDiscover] Fetching user RSVPs...");
        const { rsvpMap: userRsvps } = await fetchUserRsvps(currentUser.uid);
        // console.log("[useDiscover] User RSVPs count:", Object.keys(userRsvps).length);
        setRsvpMap(userRsvps);
      } else {
        setRsvpMap({});
      }
    };

    loadUserRsvps();
  }, [currentUser?.uid]);

  // Re-apply RSVP status to events when rsvpMap changes
  useEffect(() => {
    rsvpMapRef.current = rsvpMap;
    setEvents(prev =>
      prev.map(event => ({
        ...event,
        rsvpStatus: rsvpMap[event.id] ?? "none"
      }))
    );
  }, [rsvpMap]);

  useEffect(() => {
    fetchInitialArtworks();
    fetchMoments(null).then(initialMoments => setMoments(initialMoments));
    fetchArtists(null).then(initialProfiles => setProfiles(initialProfiles));
    fetchEvents(null).then(initialEvents => setEvents(initialEvents));
  }, [fetchInitialArtworks, fetchMoments, fetchArtists, fetchEvents]);

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
    refreshArtworks,
    moments,
    loadMoreMoments,
    isMoreMomentsLoading,
    hasMoreMoments,
    profiles,
    loadMoreProfiles,
    isMoreProfilesLoading,
    hasMoreProfiles,
    events,
    loadMoreEvents,
    isMoreEventsLoading,
    hasMoreEvents,
    updateEventRsvp,
  };
}

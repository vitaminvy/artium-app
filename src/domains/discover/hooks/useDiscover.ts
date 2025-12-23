import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
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
  loading: boolean; // Add loading state for artworks
  error: Error | null; // Add error state for artworks
  momentsLoading: boolean; // Add loading state for moments
  momentsError: Error | null; // Add error state for moments
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
  const [loading, setLoading] = useState(true); // For artworks & topPicks
  const [error, setError] = useState<Error | null>(null); // For artworks & topPicks

  // --- STATE MANAGEMENT FOR MOMENTS FETCHING ---
  const [realMoments, setRealMoments] = useState<Artwork[]>([]);
  const [momentsLoading, setMomentsLoading] = useState(true);
  const [momentsError, setMomentsError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllArtworks = async () => {
      try {
        setLoading(true);
        // Fetch trending and all artworks in parallel
        const [trendingArtworks, allArtworks] = await Promise.all([
          getTrendingArtworks(),
          getArtworks()
        ]);

        // Create a set of trending IDs for quick lookup
        const trendingIds = new Set(trendingArtworks.map(art => art.id));

        // Enrich the 'allArtworks' list with the trending status
        const enrichedArtworks = allArtworks.map(art => ({
          ...art,
          isTrending: trendingIds.has(art.id),
        }));

        setTopPicks(trendingArtworks);
        setArtworks(enrichedArtworks); // Set the enriched list
        
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAllArtworks();
  }, []); // Run once on mount

  // --- Fetch real moments (posts with media) independently ---
  useEffect(() => {
    const fetchMoments = async () => {
      try {
        setMomentsLoading(true);
        console.log('[Discover] Fetching moments...');
        const postsQuery = query(
            collection(firestore, "posts"),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        
        const postsSnapshot = await getDocs(postsQuery);
        const fetchedPosts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        // --- Fetch Author Details ONLY from 'users' collection ---
        const authorIds = [...new Set(fetchedPosts.map(p => p.authorId))];
        const authorsMap = new Map<string, { name: string; avatar: string }>();

        if (authorIds.length > 0) {
            const chunks = [];
            for (let i = 0; i < authorIds.length; i += 10) {
                chunks.push(authorIds.slice(i, i + 10));
            }

            for (const chunk of chunks) {
                const usersQuery = query(
                    collection(firestore, "users"),
                    where("uid", "in", chunk)
                );
                const userSnap = await getDocs(usersQuery);
                userSnap.forEach(doc => {
                    const data = doc.data();
                    authorsMap.set(data.uid, {
                        name: data.displayName || "Unknown User",
                        avatar: data.photoURL || "https://i.pravatar.cc/150"
                    });
                });
            }
        }

        // Filter and map to Artwork type
        const mappedMoments: Artwork[] = fetchedPosts
            .filter(post => post.mediaUrl || (post.media && (post.media.uri || (post.media.items && post.media.items.length > 0))))
            .map(post => {
                 let imageUrl = "https://via.placeholder.com/300";
                 if (post.mediaUrl) {
                     imageUrl = post.mediaUrl;
                 } else if (post.media) {
                     if (post.media.type === 'video' && post.media.uri) imageUrl = post.media.uri;
                     else if (post.media.type === 'image' && post.media.items && post.media.items.length > 0) {
                         const item = post.media.items[0];
                         imageUrl = typeof item === 'string' ? item : item.uri;
                     }
                 }

                 const author = authorsMap.get(post.authorId) || { name: "Unknown User", avatar: "https://i.pravatar.cc/150" };

                 return {
                    id: post.id,
                    title: post.content || "Untitled Moment",
                    artist: author.name, 
                    artistAvatar: author.avatar, 
                    image: imageUrl,
                    isTrending: (post.metrics?.likes || 0) > 5,
                    price: undefined,
                    location: undefined
                 };
            });
            
        console.log(`[Discover] Fetched ${mappedMoments.length} moments with author info.`);
        setRealMoments(mappedMoments);
        setMomentsError(null);
      } catch (e: any) {
        console.error("Error fetching moments:", e);
        setMomentsError(e);
      } finally {
        setMomentsLoading(false);
      }
    };

    fetchMoments();
  }, []); // Run once on mount

  // Keep mock data for other sections for now (profiles, events are still mock)
  const profiles = discoverMockData.profiles;
  const events = discoverMockData.events;

  return {
    tab,
    setTab,
    loading, // For artworks
    error, // For artworks
    momentsLoading, // For moments
    momentsError, // For moments
    topPicks,
    artworks,
    profiles,
    moments: realMoments, // Use real moments data
    events,
  };
}

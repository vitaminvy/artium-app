import { useMemo, useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
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
  const [realMoments, setRealMoments] = useState<Artwork[]>([]);

  // Fetch real moments (posts with media) independently
  useEffect(() => {
    const fetchMoments = async () => {
      try {
        console.log('[Discover] Fetching moments...');
        const q = query(
            collection(firestore, "posts"),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        
        const snapshot = await getDocs(q);
        const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
        
        // --- Fetch Author Details ---
        const authorIds = [...new Set(fetchedPosts.map(p => p.authorId))];
        const authorsMap = new Map<string, { name: string; avatar: string }>();

        if (authorIds.length > 0) {
            // Check 'artists' collection first (optional, matching feedService logic)
            // For simplicity here, let's assume most are users or check users directly.
            // Or implement the chunking logic if > 10 items (Firestore 'in' limit is 10).
            // For this quick implementation, we'll fetch users in chunks of 10.
            
            const chunks = [];
            for (let i = 0; i < authorIds.length; i += 10) {
                chunks.push(authorIds.slice(i, i + 10));
            }

            for (const chunk of chunks) {
                // Try fetching from 'users' collection
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
                
                // Also try 'artists' collection for any IDs not found yet (if applicable)
                // This mimics the full logic if needed, but 'users' covers most cases.
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
      } catch (error) {
        console.error("Error fetching moments:", error);
      }
    };

    fetchMoments();
  }, []);

  // --- Mock Data ---
  const topPicks = useMemo(() => discoverMockData.artworks.slice(0, 6), []);

  const artworks = useMemo(() => {
    if (tab === "moments") return realMoments;
    return discoverMockData.artworks;
  }, [tab, realMoments]);

  const profiles = useMemo(() => discoverMockData.profiles, []);

  const events = useMemo(() => discoverMockData.events, []);

  return {
    tab,
    setTab,
    topPicks,
    artworks,
    profiles,
    moments: realMoments,
    events,
  };
}

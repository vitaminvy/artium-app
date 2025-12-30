import { useState, useEffect, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import type { ArtworkCardItem } from "../components/profile/ArtworkCard";

/**
 * Hook to fetch artworks created by the current user (owner)
 */
export function useOwnerArtworks(limitCount: number = 20) {
  const { currentUser } = useAuth();
  const [artworks, setArtworks] = useState<ArtworkCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setLoading(false);
      setArtworks([]);
      return;
    }

    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query artworks where artistId matches the current user
        const artworksQuery = query(
          collection(firestore, "artworks"),
          where("artistId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(limitCount)
        );

        const snapshot = await getDocs(artworksQuery);

        const artworksList: ArtworkCardItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();

          // Format price: handle both string and object { currency, amount }
          let priceString: string | undefined;
          if (data.price) {
            if (typeof data.price === "string") {
              priceString = data.price;
            } else if (typeof data.price === "object" && data.price.currency && data.price.amount) {
              // Convert object to formatted string: "$1,500"
              const currency = data.price.currency === "USD" ? "$" : data.price.currency;
              const amount = Number(data.price.amount).toLocaleString();
              priceString = `${currency}${amount}`;
            }
          }

          // Ensure artist name is always a string
          let artistName = currentUser.displayName || "Unknown Artist";
          if (data.artistSnapshot?.name) {
            artistName = data.artistSnapshot.name;
          } else if (typeof data.artist === "string") {
            artistName = data.artist;
          } else if (data.artist && typeof data.artist === "object" && data.artist.name) {
            artistName = data.artist.name;
          }

          const artistAvatar =
            data.artistSnapshot?.avatar ||
            data.artistAvatar ||
            (data.artist && typeof data.artist === "object" ? data.artist.avatar : undefined) ||
            currentUser.photoURL;

          const artistVerified =
            data.artistSnapshot?.verified ??
            (data.artist && typeof data.artist === "object" ? data.artist.verified : false) ??
            false;

          return {
            id: doc.id,
            title: data.title || "Untitled",
            artist: {
              name: artistName,
              avatar: artistAvatar,
              verified: artistVerified,
            },
            image: data.images?.[0] || data.image || "",
            price: priceString,
          };
        });

        setArtworks(artworksList);
      } catch (e: any) {
        console.error("Failed to fetch owner artworks:", e);
        setError(e);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.photoURL, limitCount, refreshKey]);

  return { artworks, loading, error, refresh };
}

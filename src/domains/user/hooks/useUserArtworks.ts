import { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import type { ArtworkCardItem } from "../components/profile/ArtworkCard";

/**
 * Hook to fetch artworks created by a specific user
 */
export function useUserArtworks(userId: string, limitCount: number = 20) {
  const [artworks, setArtworks] = useState<ArtworkCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Query artworks where artistId matches the userId
        const artworksQuery = query(
          collection(firestore, "artworks"),
          where("artistId", "==", userId),
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
          // Handle case where data.artist might be string, object, or missing
          let artistName = "Unknown Artist";
          if (data.artistSnapshot?.name) {
            artistName = data.artistSnapshot.name;
          } else if (typeof data.artist === "string") {
            artistName = data.artist;
          } else if (data.artist && typeof data.artist === "object" && data.artist.name) {
            // Handle case where artist is an object with a name property
            artistName = data.artist.name;
          }

          const artistAvatar =
            data.artistSnapshot?.avatar ||
            data.artistAvatar ||
            (data.artist && typeof data.artist === "object" ? data.artist.avatar : undefined);

          const artistVerified =
            data.artistSnapshot?.verified ??
            (data.artist && typeof data.artist === "object" ? data.artist.verified : false) ??
            false;

          // Debug: Log if artist name is missing
          if (!data.artistSnapshot?.name && !data.artist) {
            console.warn("⚠️ Artwork missing artist name:", {
              artworkId: doc.id,
              title: data.title,
              artistSnapshot: data.artistSnapshot,
              artist: data.artist,
            });
          }

          return {
            id: doc.id,
            title: data.title || "Untitled",
            artist: {
              name: artistName, // Already guaranteed to be string
              avatar: artistAvatar,
              verified: artistVerified,
            },
            image: data.images?.[0] || data.image || "",
            price: priceString,
          };
        });

        setArtworks(artworksList);
      } catch (e: any) {
        console.error("Failed to fetch user artworks:", e);
        setError(e);
        setArtworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [userId, limitCount]);

  return { artworks, loading, error };
}

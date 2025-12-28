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

          return {
            id: doc.id,
            title: data.title || "Untitled",
            artist: {
              name: data.artistSnapshot?.name || data.artist || "Unknown Artist",
              avatar: data.artistSnapshot?.avatar || data.artistAvatar,
              verified: data.artistSnapshot?.verified ?? false,
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

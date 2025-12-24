import { doc, getDoc, collection, getDocs, query, where, DocumentData, updateDoc, increment, orderBy, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ArtworkDetail } from "../types";
import { Artwork as DiscoverArtwork } from "../../discover/types";

const ARTWORKS_COLLECTION = "artworks";

// --- HELPERS ---

const formatPrice = (price: any): string => {
  if (!price) return "Price on Request";
  if (typeof price === "string") return price; // Legacy data support
  if (typeof price === "object" && price.amount) {
    return `${price.currency === "USD" ? "$" : price.currency + " "}${price.amount.toLocaleString()}`;
  }
  return "Price on Request";
};

const formatWeight = (weight: any): string => {
  if (!weight) return "";
  if (typeof weight === "string") return weight;
  if (typeof weight === "object" && weight.value) {
    return `${weight.value} ${weight.unit}`;
  }
  return "";
};

// --- METRIC UPDATES ---

export const incrementArtworkView = async (artworkId: string): Promise<void> => {
  if (!artworkId) return;
  const artworkRef = doc(firestore, ARTWORKS_COLLECTION, artworkId);
  try {
    await updateDoc(artworkRef, { "metrics.views": increment(1) });
  } catch (error) {
    console.warn("Could not increment artwork view count:", error);
  }
};

export const toggleArtworkLike = async (artworkId: string, isCurrentlyLiked: boolean): Promise<void> => {
  if (!artworkId) return;
  const artworkRef = doc(firestore, ARTWORKS_COLLECTION, artworkId);
  try {
    await updateDoc(artworkRef, { "metrics.likes": increment(isCurrentlyLiked ? -1 : 1) });
  } catch (error) {
    console.error("Failed to toggle artwork like:", error);
    throw error;
  }
};

// --- DATA FETCHING (PAGINATED) ---

export type PaginatedArtworksResult = {
  artworks: DiscoverArtwork[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
};

/**
 * Fetches a paginated list of artworks.
 */
export const getArtworks = async (
  pageSize: number, 
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedArtworksResult> => {
  try {
    let artworkQuery;
    const baseQuery = [
      collection(firestore, ARTWORKS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    ];
    
    if (lastVisible) {
      artworkQuery = query(baseQuery[0], baseQuery[1], startAfter(lastVisible), baseQuery[2]);
    } else {
      artworkQuery = query(baseQuery[0], baseQuery[1], baseQuery[2]);
    }

    const snapshot = await getDocs(artworkQuery);
    const artworks = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Untitled",
        artist: data.artistSnapshot?.name || "Unknown Artist",
        artistAvatar: data.artistSnapshot?.avatar || "",
        image: data.images?.[0] || "",
        price: formatPrice(data.price),
        isTrending: false,
      };
    });

    return {
      artworks,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error getting artworks:", error);
    throw error;
  }
};

/**
 * Fetches trending artworks (non-paginated for this example, usually a smaller set).
 */
export const getTrendingArtworks = async (count: number = 10): Promise<DiscoverArtwork[]> => {
  try {
    const artworkQuery = query(
      collection(firestore, ARTWORKS_COLLECTION),
      where("popularityScore", ">", 0),
      orderBy("popularityScore", "desc"),
      limit(count)
    );
    const querySnapshot = await getDocs(artworkQuery);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Untitled",
        artist: data.artistSnapshot?.name || "Unknown Artist",
        artistAvatar: data.artistSnapshot?.avatar || "",
        image: data.images?.[0] || "",
        price: formatPrice(data.price),
        isTrending: true,
      };
    });
  } catch (error) {
    console.error("Error getting trending artworks:", error);
    throw error;
  }
};

/**
 * Fetches an artwork by ID.
 */
export const getArtworkById = async (id: string): Promise<ArtworkDetail | null> => {
  try {
    const artworkRef = doc(firestore, ARTWORKS_COLLECTION, id);
    const artworkSnap = await getDoc(artworkRef);

    if (!artworkSnap.exists()) {
      return null;
    }

    const data = artworkSnap.data();
    const dimensionData = data.dimension || {};
    const artworkDetail: ArtworkDetail = {
      id: artworkSnap.id,
      title: data.title,
      artist: {
        name: data.artistSnapshot?.name || "Unknown",
        avatar: data.artistSnapshot?.avatar || "",
        verified: data.artistSnapshot?.verified || false,
      },
      stats: data.stats || { worksSold: 0, buyers: 0 },
      price: formatPrice(data.price),
      availabilityNote: data.availabilityNote,
      images: data.images || [],
      tags: data.tags || [],
      dimension: { 
        h: dimensionData.height || 0, 
        w: dimensionData.width || 0, 
        d: dimensionData.depth || 0, 
        unit: dimensionData.unit || "in" 
      },
      weight: formatWeight(data.weight),
      year: data.year,
      edition: data.edition,
      materials: data.materials,
      shipping: (data.shipping || []).map((item: any) => ({
        title: item.title,
        subtitle: item.subtitle,
      })),
    };

    return artworkDetail;
  } catch (error) {
    console.error("Error getting artwork by ID:", error);
    throw error;
  }
};

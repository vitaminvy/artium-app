import { doc, getDoc, collection, getDocs, query, where, DocumentData, updateDoc, increment, orderBy, limit } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ArtworkDetail } from "../types";
import { Artwork as DiscoverArtwork } from "../../discover/types"; // Import the card's artwork type

const ARTWORKS_COLLECTION = "artworks";
const USERS_COLLECTION = "users"; // Changed from ARTISTS_COLLECTION

// --- NEW FUNCTIONS TO UPDATE METRICS ---

/**
 * Increments the view count for a specific artwork.
 */
export const incrementArtworkView = async (artworkId: string): Promise<void> => {
  if (!artworkId) return;
  const artworkRef = doc(firestore, ARTWORKS_COLLECTION, artworkId);
  try {
    await updateDoc(artworkRef, {
      "metrics.views": increment(1),
    });
  } catch (error) {
    console.warn("Could  not increment artwork view count:", error);
    // Non-critical, so we don't throw
  }
};

/**
 * Toggles the like status for an artwork, incrementing or decrementing the count.
 */
export const toggleArtworkLike = async (artworkId: string, isCurrentlyLiked: boolean): Promise<void> => {
  if (!artworkId) return;
  const artworkRef = doc(firestore, ARTWORKS_COLLECTION, artworkId);
  try {
    await updateDoc(artworkRef, {
      "metrics.likes": increment(isCurrentlyLiked ? -1 : 1),
    });
  } catch (error) {
    console.error("Failed to toggle artwork like:", error);
    throw error; // Re-throw as this is a user-facing action that should be handled
  }
};


// --- EXISTING FUNCTIONS ---

type ArtistData = {
  name: string;
  avatar: string;
  verified: boolean;
};

type ArtworkDoc = {
  id: string;
  title: string;
  artistId: string;
  images?: string[];
  price?: string;
};

// Helper function to get artist data (from USERS collection)
const _getArtistById = async (id: string): Promise<ArtistData> => {
  const userRef = doc(firestore, USERS_COLLECTION, id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return { name: "Unknown Artist", avatar: "", verified: false };
  }
  
  const userData = userSnap.data();
  return {
    name: userData.displayName || "Unknown User",
    avatar: userData.photoURL || "",
    verified: false, // Default to false or check userData.role === 'artist' or userData.isVerified
  };
};

// Helper to combine artworks and artists (from USERS collection)
const _combineArtworksWithArtists = async (artworksFromDB: ArtworkDoc[], defaultIsTrending: boolean = false): Promise<DiscoverArtwork[]> => {
  if (artworksFromDB.length === 0) {
    return [];
  }

  const artistIds = [...new Set(artworksFromDB.map(art => art.artistId).filter(id => id))];

  let artistsMap = new Map<string, ArtistData>();
  if (artistIds.length > 0) {
    const userQuery = query(collection(firestore, USERS_COLLECTION), where("__name__", "in", artistIds));
    const userSnapshots = await getDocs(userQuery);
    userSnapshots.forEach(doc => {
      const data = doc.data();
      artistsMap.set(doc.id, {
        name: data.displayName || "Unknown User",
        avatar: data.photoURL || "",
        verified: false, // Default or check data.isVerified
      });
    });
  }

  return artworksFromDB.map(art => {
    const artist = artistsMap.get(art.artistId) || { name: "Unknown Artist", avatar: "", verified: false };
        return {
            id: art.id,
            title: art.title,
            artist: artist.name,
            artistAvatar: artist.avatar,
            image: art.images?.[0] || "",
            price: art.price,
            isTrending: defaultIsTrending, // Apply the trending flag here
          };  });
};


/**
 * Fetches all artworks and formats them for the Discover screen.
 */
export const getArtworks = async (): Promise<DiscoverArtwork[]> => {
  try {
    const artworkQuery = query(collection(firestore, ARTWORKS_COLLECTION));
    const artworkSnapshots = await getDocs(artworkQuery);
    const artworksFromDB = artworkSnapshots.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as ArtworkDoc)
    );
    return await _combineArtworksWithArtists(artworksFromDB, false);
  } catch (error) {
    console.error("Error getting artworks for discover:", error);
    throw error;
  }
};

/**
 * Fetches trending artworks (ordered by popularityScore) for the Discover screen.
 */
export const getTrendingArtworks = async (count: number = 10): Promise<DiscoverArtwork[]> => {
  try {
    const artworkQuery = query(
      collection(firestore, ARTWORKS_COLLECTION),
      where("popularityScore", ">", 0),
      orderBy("popularityScore", "desc"),
      limit(count)
    );
    const artworkSnapshots = await getDocs(artworkQuery);
    const artworksFromDB = artworkSnapshots.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as ArtworkDoc)
    );
    return await _combineArtworksWithArtists(artworksFromDB, true);
  } catch (error) {
    console.error("Error getting trending artworks:", error);
    // Firestore will throw an error if the index is missing.
    // This error message will contain a link to create it in the Firebase console.
    throw error;
  }
};


/**
 * Fetches an artwork by ID and combines it with its artist's data.
 */
export const getArtworkById = async (id: string): Promise<ArtworkDetail | null> => {
  try {
    const artworkRef = doc(firestore, ARTWORKS_COLLECTION, id);
    const artworkSnap = await getDoc(artworkRef);

    if (!artworkSnap.exists()) {
      console.log("No such artwork document!");
      return null;
    }

    const artworkData = artworkSnap.data() as any;
    const artistId = artworkData.artistId;

    if (!artistId) {
      throw new Error(`Artwork with ID ${id} is missing an artistId.`);
    }

    const artistInfo = await _getArtistById(artistId);

    const artworkDetail: ArtworkDetail = {
      id: artworkSnap.id,
      title: artworkData.title,
      artist: artistInfo,
      stats: artworkData.stats,
      price: artworkData.price,
      availabilityNote: artworkData.availabilityNote,
      images: artworkData.images,
      tags: artworkData.tags,
      dimension: artworkData.dimension,
      weight: artworkData.weight,
      year: artworkData.year,
      edition: artworkData.edition,
      materials: artworkData.materials,
      shipping: (artworkData.shipping || []).map((item: any) => ({
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

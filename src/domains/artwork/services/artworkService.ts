import { doc, getDoc, collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ArtworkDetail } from "../types";
import { Artwork as DiscoverArtwork } from "../../discover/types"; // Import the card's artwork type

const ARTWORKS_COLLECTION = "artworks";
const ARTISTS_COLLECTION = "artists";

type ArtistData = {
  name: string;
  avatar: string;
  verified: boolean;
};

type ArtworkDoc = {
  id: string;
  title: string;
  artistId: string;
  stats: { worksSold: number; buyers: number };
  price: string;
  availabilityNote?: string;
  images: string[];
  tags: string[];
  dimension: { h: number; w: number; d: number; unit: string };
  weight: string;
  year: number;
  edition: number;
  materials: string;
  shipping: { title: string; subtitle?: string }[];
};

// Helper function to get artist data
const _getArtistById = async (id: string): Promise<ArtistData> => {
  const artistRef = doc(firestore, ARTISTS_COLLECTION, id);
  const artistSnap = await getDoc(artistRef);

  if (!artistSnap.exists()) {
    return { name: "Unknown Artist", avatar: "", verified: false };
  }
  
  const artistData = artistSnap.data();
  return {
    name: artistData.name,
    avatar: artistData.avatar,
    verified: artistData.verified || false,
  };
};

/**
 * Fetches all artworks and formats them for the Discover screen.
 */
export const getArtworks = async (): Promise<DiscoverArtwork[]> => {
  try {
    // 1. Fetch all artwork documents
    const artworkQuery = query(collection(firestore, ARTWORKS_COLLECTION));
    const artworkSnapshots = await getDocs(artworkQuery);
    const artworksFromDB = artworkSnapshots.docs.map(
      doc => ({ id: doc.id, ...doc.data() } as ArtworkDoc)
    );

    if (artworksFromDB.length === 0) {
      return [];
    }

    // 2. Collect all unique artist IDs
    const artistIds = [...new Set(artworksFromDB.map(art => art.artistId).filter(id => id))];

    // 3. Fetch all required artist documents in a single query
    let artistsMap = new Map<string, ArtistData>();
    if (artistIds.length > 0) {
      const artistQuery = query(collection(firestore, ARTISTS_COLLECTION), where("__name__", "in", artistIds));
      const artistSnapshots = await getDocs(artistQuery);
      artistSnapshots.forEach(doc => {
        const data = doc.data();
        artistsMap.set(doc.id, {
          name: data.name,
          avatar: data.avatar,
          verified: data.verified || false,
        });
      });
    }

    // 4. Combine artwork and artist data
    const discoverArtworks: DiscoverArtwork[] = artworksFromDB.map(art => {
      const artist = artistsMap.get(art.artistId) || { name: "Unknown Artist", avatar: "", verified: false };
      return {
        id: art.id,
        title: art.title,
        artist: artist.name,
        artistAvatar: artist.avatar,
        image: art.images?.[0] || "", // Use the first image as the preview
        price: art.price,
        // isTrending and location are not in our ArtworkDetail model, so they are omitted
      };
    });

    return discoverArtworks;

  } catch (error) {
    console.error("Error getting artworks for discover:", error);
    throw error;
  }
};


/**
 * Fetches an artwork by ID and combines it with its artist's data.
 * The artwork document in Firestore is expected to have an `artistId` field.
 */
export const getArtworkById = async (id: string): Promise<ArtworkDetail | null> => {
  try {
    // Step 1: Fetch the artwork document
    const artworkRef = doc(firestore, ARTWORKS_COLLECTION, id);
    const artworkSnap = await getDoc(artworkRef);

    if (!artworkSnap.exists()) {
      console.log("No such artwork document!");
      return null;
    }

    const artworkData = artworkSnap.data();
    const artistId = artworkData.artistId;

    if (!artistId) {
      throw new Error(`Artwork with ID ${id} is missing an artistId.`);
    }

    // Step 2: Fetch the artist document
    const artistInfo = await _getArtistById(artistId);

    // Step 3: Combine the data into the ArtworkDetail type
    const artworkDetail: ArtworkDetail = {
      id: artworkSnap.id,
      title: artworkData.title,
      artist: artistInfo, // Combined artist data
      stats: {
        worksSold: artworkData.stats.worksSold,
        buyers: artworkData.stats.buyers,
      },
      price: artworkData.price,
      availabilityNote: artworkData.availabilityNote,
      images: artworkData.images,
      tags: artworkData.tags,
      dimension: {
        h: artworkData.dimension.h,
        w: artworkData.dimension.w,
        d: artworkData.dimension.d,
        unit: artworkData.dimension.unit,
      },
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
    // Propagate the error to be handled by the UI
    throw error;
  }
};

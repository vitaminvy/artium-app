import { doc, getDoc, DocumentData } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ArtworkDetail } from "../types";

const ARTWORKS_COLLECTION = "artworks";
const ARTISTS_COLLECTION = "artists";

// Helper function to get artist data. This could be in a separate artistService.ts later.
const _getArtistById = async (id: string): Promise<ArtworkDetail['artist']> => {
  const artistRef = doc(firestore, ARTISTS_COLLECTION, id);
  const artistSnap = await getDoc(artistRef);

  if (!artistSnap.exists()) {
    // Return a default/unknown artist structure if not found
    return {
      name: "Unknown Artist",
      avatar: "",
      verified: false,
    };
  }
  
  const artistData = artistSnap.data();
  return {
    name: artistData.name,
    avatar: artistData.avatar,
    verified: artistData.verified || false,
  };
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
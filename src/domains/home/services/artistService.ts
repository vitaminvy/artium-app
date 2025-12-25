import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { HomeFollowingProfile } from "../types";

const USERS_COLLECTION = "users";

/**
 * Fetches a list of popular artists.
 * In a real app, this would be ordered by follower count or another metric.
 * For now, it just gets users who are artists.
 */
export const getPopularArtists = async (count: number = 15): Promise<HomeFollowingProfile[]> => {
  try {
    const artistsQuery = query(
      collection(firestore, USERS_COLLECTION),
      where("roles.isArtist", "==", true),
      // orderBy("stats.followers", "desc"), // This would require an index
      limit(count)
    );

    const snapshot = await getDocs(artistsQuery);
    const artists = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.displayName,
        subtitle: data.bio,
        avatar: data.photoURL,
        verified: true, // Assuming seeded artists are verified
      } as HomeFollowingProfile;
    });

    return artists;
  } catch (error) {
    console.error("Error getting popular artists:", error);
    return [];
  }
};

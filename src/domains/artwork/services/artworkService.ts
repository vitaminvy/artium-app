import { doc, getDoc, collection, getDocs, query, where, DocumentData, updateDoc, increment, orderBy, limit, startAfter, QueryDocumentSnapshot } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ArtworkDetail } from "../types";
import { Artwork as DiscoverArtwork } from "../../discover/types";

const ARTWORKS_COLLECTION = "artworks";

// --- HELPERS ---

const toNumber = (value: any, fallback: number = 0): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

const formatPrice = (price: any): string => {
  if (price === undefined || price === null) return "Price on Request";
  if (typeof price === "string") return price; // Legacy data support
  if (typeof price === "number") {
    return `$${price.toLocaleString()}`;
  }
  if (typeof price === "object") {
    const amountRaw = price.amount;
    if (amountRaw === undefined || amountRaw === null || amountRaw === "") {
      return "Price on Request";
    }
    const amount = typeof amountRaw === "number" ? amountRaw : Number(amountRaw);
    const amountLabel = Number.isFinite(amount)
      ? amount.toLocaleString()
      : String(amountRaw);
    const currency =
      typeof price.currency === "string" && price.currency.trim()
        ? price.currency
        : "USD";
    const prefix = currency === "USD" ? "$" : `${currency} `;
    return `${prefix}${amountLabel}`;
  }
  return "Price on Request";
};

const formatWeight = (weight: any): string => {
  if (weight === undefined || weight === null) return "";
  if (typeof weight === "string") return weight;
  if (typeof weight === "number") return `${weight}`;
  if (typeof weight === "object") {
    const value = toNumber(weight.value, 0);
    const unit = typeof weight.unit === "string" ? weight.unit : "";
    return unit ? `${value} ${unit}` : `${value}`;
  }
  return "";
};

const resolveArtistSnapshot = (data: any) => {
  const readString = (value: any) =>
    typeof value === "string" ? value.trim() : "";
  const sources = [
    data.artistSnapshot,
    data.artistsSnapshot,
    data.artist,
  ];
  const snapshot = sources.find((candidate: any) => {
    if (!candidate) return false;
    if (typeof candidate === "string") return candidate.trim().length > 0;
    if (typeof candidate !== "object") return false;
    const name =
      readString(candidate.name) ||
      readString(candidate.displayName) ||
      readString(candidate.fullName);
    const avatar =
      readString(candidate.avatar) ||
      readString(candidate.avatarUrl) ||
      readString(candidate.photoURL) ||
      readString(candidate.photoUrl) ||
      readString(candidate.image) ||
      readString(candidate.imageUrl);
    return Boolean(name || avatar);
  }) ?? {};

  if (typeof snapshot === "string") {
    return {
      name: snapshot || "Unknown",
      avatar: "",
      verified: false,
    };
  }

  const name =
    readString(snapshot.name) ||
    readString(snapshot.displayName) ||
    readString(snapshot.fullName) ||
    readString(data.authorName) ||
    "Unknown";
  const avatar =
    readString(snapshot.avatar) ||
    readString(snapshot.avatarUrl) ||
    readString(snapshot.photoURL) ||
    readString(snapshot.photoUrl) ||
    readString(snapshot.image) ||
    readString(snapshot.imageUrl) ||
    readString(data.authorAvatar) ||
    "";
  return {
    name,
    avatar,
    verified: !!snapshot.verified,
  };
};

const normalizeDimension = (dimension: any) => {
  const source = dimension || {};
  const unit =
    typeof source.unit === "string" && source.unit.trim() ? source.unit : "in";
  return {
    h: toNumber(source.height ?? source.h, 0),
    w: toNumber(source.width ?? source.w, 0),
    d: toNumber(source.depth ?? source.d, 0),
    unit,
  };
};

const normalizeImageList = (images: any): string[] => {
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return (
          item.uri ||
          item.url ||
          item.image ||
          item.imageUrl ||
          ""
        );
      }
      return "";
    })
    .filter((item) => typeof item === "string" && item.trim().length > 0);
};

const resolveFirstImage = (images: any): string => {
  return normalizeImageList(images)[0] || "";
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
      const artist = resolveArtistSnapshot(data);
      return {
        id: doc.id,
        title: data.title || "Untitled",
        artist: artist.name || "Unknown Artist",
        artistAvatar: artist.avatar || "",
        image: resolveFirstImage(data.images),
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
      const artist = resolveArtistSnapshot(data);
      return {
        id: doc.id,
        title: data.title || "Untitled",
        artist: artist.name || "Unknown Artist",
        artistAvatar: artist.avatar || "",
        image: resolveFirstImage(data.images),
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
    const artworkDetail: ArtworkDetail = {
      id: artworkSnap.id,
      title: data.title || "Untitled",
      artist: resolveArtistSnapshot(data),
      stats: data.stats || { worksSold: 0, buyers: 0 },
      price: formatPrice(data.price),
      availabilityNote: data.availabilityNote,
      images: normalizeImageList(data.images),
      tags: data.tags || [],
      dimension: normalizeDimension(data.dimension),
      weight: formatWeight(data.weight),
      weightValue:
        data.weight && typeof data.weight === "object"
          ? toNumber(data.weight.value, 0)
          : undefined,
      weightUnit:
        data.weight && typeof data.weight === "object"
          ? data.weight.unit
          : undefined,
      year: toNumber(data.year, 0),
      edition: toNumber(data.edition, 0),
      materials: data.materials || "",
      shipping: (data.shipping || []).map((item: any) => ({
        title: item.title,
        subtitle: item.subtitle,
      })),
      description: data.description || "",
      metrics: data.metrics,
      status: data.status,
      priceSnapshot: typeof data.price === "object" ? data.price : undefined,
    };

    return artworkDetail;
  } catch (error) {
    console.error("Error getting artwork by ID:", error);
    throw error;
  }
};

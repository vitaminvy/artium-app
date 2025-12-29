import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  query,
  increment,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";

export type Moodboard = {
  id: string;
  name: string;
  count: number;
  cover?: string;
  isPrivate?: boolean;
};

export type MoodboardItem = {
  artworkId: string;
  title: string;
  image?: string | null;
  price?: string | null;
};

export const fetchMoodboards = async (userId: string): Promise<Moodboard[]> => {
  const boardsCol = collection(firestore, "users", userId, "moodboards");
  const snapshot = await getDocs(query(boardsCol));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name ?? "Untitled",
      count: data.count ?? 0,
      cover: data.cover,
      isPrivate: data.isPrivate ?? false,
    };
  });
};

export const createMoodboard = async (
  userId: string,
  name: string,
  options?: { isPrivate?: boolean; cover?: string }
): Promise<Moodboard> => {
  const boardsCol = collection(firestore, "users", userId, "moodboards");
  const boardRef = doc(boardsCol);
  const payload = {
    name: name.trim() || "Untitled",
    count: 0,
    isPrivate: options?.isPrivate ?? false,
    cover: options?.cover ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(boardRef, payload);
  return {
    id: boardRef.id,
    name: payload.name,
    count: 0,
    cover: payload.cover ?? undefined,
    isPrivate: payload.isPrivate,
  };
};

export const addArtworkToMoodboard = async (
  userId: string,
  moodboardId: string,
  artwork: {
    id: string;
    title: string;
    image?: string;
    price?: string;
  }
) => {
  const boardRef = doc(firestore, "users", userId, "moodboards", moodboardId);
  const itemRef = doc(collection(boardRef, "items"), artwork.id);

  await setDoc(
    itemRef,
    {
      artworkId: artwork.id,
      title: artwork.title,
      image: artwork.image ?? null,
      price: artwork.price ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await updateDoc(boardRef, {
    updatedAt: serverTimestamp(),
    count: increment(1),
  });
};

export const fetchMoodboardItems = async (
  userId: string,
  moodboardId: string
): Promise<MoodboardItem[]> => {
  const boardRef = doc(firestore, "users", userId, "moodboards", moodboardId);
  const itemsCol = collection(boardRef, "items");
  const snapshot = await getDocs(itemsCol);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      artworkId: data.artworkId ?? docSnap.id,
      title: data.title ?? "Untitled",
      image: data.image ?? null,
      price: data.price ?? null,
    } as MoodboardItem;
  });
};

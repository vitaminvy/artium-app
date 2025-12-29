import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  serverTimestamp,
  setDoc,
  query,
  increment,
  updateDoc,
  runTransaction,
  limit,
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
  const boards = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      const boardRef = doc(boardsCol, docSnap.id);
      let count = data.count ?? 0;
      let cover: string | null | undefined = data.cover ?? null;
      try {
        const itemsCol = collection(boardRef, "items");
        const countSnap = await getCountFromServer(itemsCol);
        const actualCount = countSnap.data().count;
        if (actualCount !== count) {
          await updateDoc(boardRef, {
            count: actualCount,
            updatedAt: serverTimestamp(),
          });
          count = actualCount;
        }
        if (!cover) {
          const firstItemSnap = await getDocs(query(itemsCol, limit(1)));
          cover = firstItemSnap.docs[0]?.data()?.image ?? null;
        }
      } catch (err) {
        console.warn("Failed to sync moodboard count:", err);
      }
      return {
        id: docSnap.id,
        name: data.name ?? "Untitled",
        count,
        cover: cover ?? undefined,
        isPrivate: data.isPrivate ?? false,
      };
    })
  );
  return boards;
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

  await runTransaction(firestore, async (tx) => {
    const itemSnap = await tx.get(itemRef);
    if (itemSnap.exists()) {
      tx.update(boardRef, { updatedAt: serverTimestamp() });
      return;
    }

    tx.set(
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

    tx.update(boardRef, {
      updatedAt: serverTimestamp(),
      count: increment(1),
    });
  });
};

export const findMoodboardForArtwork = async (
  userId: string,
  artworkId: string
): Promise<string | null> => {
  if (!userId || !artworkId) return null;
  const boards = await fetchMoodboards(userId);
  for (const board of boards) {
    const itemRef = doc(
      firestore,
      "users",
      userId,
      "moodboards",
      board.id,
      "items",
      artworkId
    );
    const itemSnap = await getDoc(itemRef);
    if (itemSnap.exists()) return board.id;
  }
  return null;
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

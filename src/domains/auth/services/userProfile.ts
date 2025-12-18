import { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { firestore } from "@/configs/firebase";

type ProfileExtras = {
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
};

/**
 * Ensure a user document exists/updates in Firestore.
 * - If user exists: updates lastLoginAt and syncs basic info.
 * - If user is new: creates document with createdAt.
 */
export async function upsertUserProfile(
  user: User,
  extras: ProfileExtras = {}
) {
  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const userData = {
    uid: user.uid,
    email: user.email ?? extras.email ?? "",
    displayName:
      extras.displayName ??
      user.displayName ??
      user.email ??
      extras.email ??
      "",
    photoURL: extras.photoURL ?? user.photoURL ?? null,
    lastLoginAt: serverTimestamp(),
  };

  if (userSnap.exists()) {
    // Update existing user - preserve createdAt
    await updateDoc(userRef, {
      ...userData,
      // Only update these if they are truthy in userData to avoid wiping existing data with empty strings if auth provider is missing info
      ...(userData.email && { email: userData.email }),
      ...(userData.displayName && { displayName: userData.displayName }),
      ...(userData.photoURL && { photoURL: userData.photoURL }),
    });
  } else {
    // Create new user
    await setDoc(userRef, {
      ...userData,
      role: "art_lover",
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
    });
  }
}

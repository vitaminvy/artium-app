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
    const existing = userSnap.data() ?? {};
    const updates: Record<string, any> = {
      lastLoginAt: serverTimestamp(),
    };

    if (extras.email) {
      updates.email = extras.email;
    } else if (!existing.email && userData.email) {
      updates.email = userData.email;
    }

    if (extras.displayName) {
      updates.displayName = extras.displayName;
    } else if (!existing.displayName && userData.displayName) {
      updates.displayName = userData.displayName;
    }

    if (extras.photoURL) {
      updates.photoURL = extras.photoURL;
    } else if (!existing.photoURL && userData.photoURL) {
      updates.photoURL = userData.photoURL;
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  } else {
    // Create new user with new Schema
    await setDoc(userRef, {
      ...userData,
      username: (userData.email || userData.uid).split("@")[0], // Simple default username
      roles: {
        isArtist: false,
        isAdmin: false,
      },
      stats: {
        followers: 0,
        following: 0,
        artworks: 0,
        sold: 0,
      },
      bio: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

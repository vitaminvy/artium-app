import { User } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { firestore } from "@/configs/firebase";

type ProfileExtras = {
  displayName?: string | null;
  photoURL?: string | null;
  email?: string | null;
};

/**
 * Ensure a user document exists/updates in Firestore.
 */
export async function upsertUserProfile(
  user: User,
  extras: ProfileExtras = {}
) {
  await setDoc(
    doc(firestore, "users", user.uid),
    {
      uid: user.uid,
      email: user.email ?? extras.email ?? "",
      displayName:
        extras.displayName ??
        user.displayName ??
        user.email ??
        extras.email ??
        "",
      photoURL: extras.photoURL ?? user.photoURL ?? null,
      role: "art_lover",
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
}

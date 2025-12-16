import { updateProfile, UserCredential } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { firestore } from "@/configs/firebase";
import { doCreateUserWithEmailAndPassword } from "./firebaseAuth";

/**
 * Create a new user account and seed a basic profile document.
 */
export async function register(
  email: string,
  password: string,
  name?: string
): Promise<UserCredential> {
  const credential = await doCreateUserWithEmailAndPassword(
    email.trim(),
    password
  );

  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }

  await setDoc(
    doc(firestore, "users", credential.user.uid),
    {
      uid: credential.user.uid,
      email: credential.user.email,
      displayName:
        name || credential.user.displayName || credential.user.email || "",
      role: "art_lover",
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );

  return credential;
}

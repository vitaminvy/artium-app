import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { firestore } from "@/configs/firebase";

export const syncUserToFirestore = async (
  user: User,
  additionalData?: { [key: string]: any }
) => {
  const userRef = doc(firestore, "users", user.uid);
  
  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    },
    { merge: true }
  );
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(firestore, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserPushToken = async (uid: string, token: string) => {
  try {
    const userRef = doc(firestore, "users", uid);
    await setDoc(
      userRef,
      {
        expoPushToken: token,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating push token:", error);
  }
};

import { doc, setDoc } from "firebase/firestore";
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
      createdAt: user.metadata.creationTime,
      lastLoginAt: user.metadata.lastSignInTime,
      ...additionalData,
    },
    { merge: true }
  );
};

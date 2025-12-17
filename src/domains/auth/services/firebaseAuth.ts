import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updatePassword,
} from "firebase/auth";

import { auth } from "@/configs/firebase";

// Email/password auth
export const doCreateUserWithEmailAndPassword = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

export const doSignInWithEmailAndPassword = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

// Google sign-in for React Native (expects an ID token from Google Sign-In SDK)
export const doSignInWithGoogleIdToken = async (idToken: string) => {
  const credential = GoogleAuthProvider.credential(idToken);
  return signInWithCredential(auth, credential);
};

export const doSignOut = () => firebaseSignOut(auth);

export const doPasswordReset = (email: string) =>
  sendPasswordResetEmail(auth, email);

export const doPasswordChange = (password: string) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user to update password for.");
  }
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = (redirectUrl?: string) => {
  if (!auth.currentUser) {
    throw new Error("No authenticated user to send verification to.");
  }
  return redirectUrl
    ? sendEmailVerification(auth.currentUser, { url: redirectUrl })
    : sendEmailVerification(auth.currentUser);
};

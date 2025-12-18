import { useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

import { auth } from "@/configs/firebase";
import { upsertUserProfile } from "@/domains/auth/services/userProfile";

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type !== "success" || !signInResult.data?.idToken) {
        throw new Error("Google sign-in did not complete. Please try again.");
      }

      const { idToken, user: googleUser } = signInResult.data;
      const googleCredential = GoogleAuthProvider.credential(idToken);

      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      // Sync user profile to Firestore
      await upsertUserProfile(firebaseUser, {
        email: firebaseUser.email || googleUser.email,
        displayName: firebaseUser.displayName || googleUser.name,
        photoURL: firebaseUser.photoURL || googleUser.photo,
      });

      return firebaseUser;
    } catch (err: any) {
      let msg = "Google sign-in failed";

      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        msg = "Google sign-in was cancelled.";
      } else if (err.code === statusCodes.IN_PROGRESS) {
        msg = "Google sign-in is already in progress.";
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        msg = "Google Play Services not available.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "Network unavailable. Please check your connection and try again.";
      } else {
        msg = `Google sign-in failed: ${err.message || "Unknown error"}`;
      }
      
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    signInWithGoogle,
    loading,
    error,
    clearError,
  };
}

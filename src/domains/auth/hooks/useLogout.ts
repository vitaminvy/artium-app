import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

import { useAuth } from "../contexts/AuthContext";
import { doSignOut } from "../services/firebaseAuth";
import { tokenStorage } from "../services/tokenStorage";
import { useProfileContext } from "@/domains/user/contexts/ProfileContext";
import { useProfileCompletion } from "@/domains/user/contexts/ProfileCompletionContext";

export function useLogout() {
  const { isGoogleUser } = useAuth();
  const { resetProfile } = useProfileContext();
  const { resetCompletion } = useProfileCompletion();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const performLogout = useCallback(async () => {
    setLoading(true);
    try {
      // Sign out from Google if user logged in with Google
      if (isGoogleUser) {
        try {
          await GoogleSignin.signOut();
        } catch (err) {
          console.warn("Failed to sign out of Google session", err);
        }
      }

      // Sign out from Firebase
      await doSignOut();

      // Clear stored tokens
      await tokenStorage.remove().catch(() => undefined);

      // Reset all context states to clear user data
      resetProfile();
      resetCompletion();

      // Note: Navigation stack is automatically reset by RootNavigator
      // when AuthContext.status changes from "authenticated" to "unauthenticated"
      // No need to manually reset navigation here

      // Close modal after successful logout
      setShowConfirmModal(false);
      return true;
    } catch (err) {
      console.error("Failed to log out", err);
      Alert.alert("Log out failed", "Please try again.");
      setShowConfirmModal(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isGoogleUser, resetProfile, resetCompletion]);

  const logout = useCallback(() => {
    if (loading) return;
    setShowConfirmModal(true);
  }, [loading]);

  const handleCancelLogout = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  return {
    logout,
    loading,
    showConfirmModal,
    onConfirmLogout: performLogout,
    onCancelLogout: handleCancelLogout,
  };
}

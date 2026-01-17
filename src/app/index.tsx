import React, { useCallback, useEffect } from "react";
import RootNavigator from "./navigation/RootNavigator";
import { useAuth, AuthProvider } from "../domains/auth/contexts/AuthContext";
import { ProfileProvider } from "../domains/user/contexts/ProfileContext";
import {
  ProfileCompletionProvider,
  useProfileCompletion,
} from "../domains/user/contexts/ProfileCompletionContext";
import Loader from "../shared/components/Loader";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import ProfileOnboardingModal from "../domains/user/components/onboarding/ProfileOnboardingModal";
import { navigate } from "./navigation/navigationRef";
import { FeedProvider } from "../domains/feed/contexts/FeedContext";
import { usePushNotifications } from "../shared/hooks/usePushNotifications";

function NavigationWrapper() {
  const auth = useAuth();
  usePushNotifications();
  const { shouldPrompt, dismissPrompt } = useProfileCompletion();

  useEffect(() => {
    // Configure Google Sign-In once when the app's navigation is ready.
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  const handleStartExploring = useCallback(async () => {
    await dismissPrompt();
  }, [dismissPrompt]);

  const handleEditProfile = useCallback(async () => {
    await dismissPrompt();
    navigate("Tabs", { screen: "Home", params: { screen: "EditProfile" } });
  }, [dismissPrompt]);

  if (auth.status === "loading") {
    return <Loader />;
  }

  return (
    <>
      <RootNavigator authStatus={auth.status} />
      <ProfileOnboardingModal
        visible={shouldPrompt}
        onStartExploring={handleStartExploring}
        onEditProfile={handleEditProfile}
      />
    </>
  );
}

export default function AppEntry() {
  return (
    <AuthProvider>
      <ProfileCompletionProvider>
        <FeedProvider>
          <ProfileProvider>
            <NavigationWrapper />
          </ProfileProvider>
        </FeedProvider>
      </ProfileCompletionProvider>
    </AuthProvider>
  );
}

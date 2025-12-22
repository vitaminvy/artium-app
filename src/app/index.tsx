import React, { useEffect } from "react";
import RootNavigator from "./navigation/RootNavigator";
import { useAuth, AuthProvider } from "../domains/auth/contexts/AuthContext";
import { ProfileProvider } from "../domains/user/contexts/ProfileContext";
import Loader from "../shared/components/Loader";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

function NavigationWrapper() {
  const auth = useAuth();

  useEffect(() => {
    // Configure Google Sign-In once when the app's navigation is ready.
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      offlineAccess: false,
    });
  }, []);

  if (auth.status === "loading") {
    return <Loader />;
  }

  return <RootNavigator authStatus={auth.status} />;
}

export default function AppEntry() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NavigationWrapper />
      </ProfileProvider>
    </AuthProvider>
  );
}

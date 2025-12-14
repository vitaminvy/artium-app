import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

import { auth } from "@/configs/firebase";
import { AuthStatus } from "@/domains/auth/types";

type AuthContextType = {
  currentUser: User | null;
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  loading: boolean;
  status: AuthStatus;
  setCurrentUser: (user: User | null) => void;
};

const defaultValue: AuthContextType = {
  currentUser: null,
  userLoggedIn: false,
  isEmailUser: false,
  isGoogleUser: false,
  loading: true,
  status: "loading",
  setCurrentUser: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>(defaultValue);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isEmail = user.providerData.some(
          (provider) => provider.providerId === "password"
        );
        const isGoogle = user.providerData.some(
          (provider) => provider.providerId === "google.com"
        );

        setState((prev) => ({
          ...prev,
          currentUser: { ...user },
          userLoggedIn: true,
          isEmailUser: isEmail,
          isGoogleUser: isGoogle,
          loading: false,
          status: "authenticated",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          currentUser: null,
          userLoggedIn: false,
          isEmailUser: false,
          isGoogleUser: false,
          loading: false,
          status: "unauthenticated",
        }));
      }
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    ...state,
    setCurrentUser: (user: User | null) =>
      setState((prev) => ({ ...prev, currentUser: user })),
  };

  return (
    <AuthContext.Provider value={value}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

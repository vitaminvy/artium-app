import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { firestore } from "@/configs/firebase";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { upsertUserProfile } from "@/domains/auth/services/userProfile";

type ProfileCompletionContextValue = {
  loading: boolean;
  profileCompleted: boolean;
  promptDismissed: boolean;
  shouldPrompt: boolean;
  refresh: () => Promise<void>;
  dismissPrompt: () => Promise<void>;
  markProfileCompleted: () => Promise<void>;
  resetCompletion: () => void;
};

const defaultValue: ProfileCompletionContextValue = {
  loading: false,
  profileCompleted: true,
  promptDismissed: true,
  shouldPrompt: false,
  refresh: async () => {},
  dismissPrompt: async () => {},
  markProfileCompleted: async () => {},
  resetCompletion: () => {},
};

const ProfileCompletionContext =
  createContext<ProfileCompletionContextValue>(defaultValue);

const resolveFlags = (data?: Record<string, any>) => {
  const profileCompleted =
    typeof data?.profileCompleted === "boolean" ? data.profileCompleted : true;
  const promptDismissed =
    typeof data?.profilePromptDismissed === "boolean"
      ? data.profilePromptDismissed
      : profileCompleted;

  return { profileCompleted, promptDismissed };
};

export function ProfileCompletionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, status } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [promptDismissed, setPromptDismissed] = useState(true);

  const refresh = useCallback(async () => {
    if (status !== "authenticated" || !currentUser) {
      setLoading(false);
      setProfileCompleted(true);
      setPromptDismissed(true);
      return;
    }

    setLoading(true);
    try {
      await upsertUserProfile(currentUser);
      const userRef = doc(firestore, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const { profileCompleted, promptDismissed } = resolveFlags(
        userSnap.data()
      );
      setProfileCompleted(profileCompleted);
      setPromptDismissed(promptDismissed);
    } catch (error) {
      console.warn("Failed to load profile completion status:", error);
      setProfileCompleted(true);
      setPromptDismissed(true);
    } finally {
      setLoading(false);
    }
  }, [currentUser, status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dismissPrompt = useCallback(async () => {
    if (!currentUser) return;
    try {
      await upsertUserProfile(currentUser);
      const userRef = doc(firestore, "users", currentUser.uid);
      await setDoc(
        userRef,
        { profilePromptDismissed: true },
        { merge: true }
      );
      setPromptDismissed(true);
    } catch (error) {
      console.warn("Failed to dismiss profile prompt:", error);
    }
  }, [currentUser]);

  const markProfileCompleted = useCallback(async () => {
    if (!currentUser) return;
    try {
      await upsertUserProfile(currentUser);
      const userRef = doc(firestore, "users", currentUser.uid);
      await setDoc(
        userRef,
        {
          profileCompleted: true,
          profilePromptDismissed: true,
          profileCompletedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setProfileCompleted(true);
      setPromptDismissed(true);
    } catch (error) {
      console.warn("Failed to mark profile completed:", error);
    }
  }, [currentUser]);

  const resetCompletion = useCallback(() => {
    setLoading(false);
    setProfileCompleted(true);
    setPromptDismissed(true);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      profileCompleted,
      promptDismissed,
      shouldPrompt: !loading && !profileCompleted && !promptDismissed,
      refresh,
      dismissPrompt,
      markProfileCompleted,
      resetCompletion,
    }),
    [
      loading,
      profileCompleted,
      promptDismissed,
      refresh,
      dismissPrompt,
      markProfileCompleted,
      resetCompletion,
    ]
  );

  return (
    <ProfileCompletionContext.Provider value={value}>
      {children}
    </ProfileCompletionContext.Provider>
  );
}

export const useProfileCompletion = () =>
  useContext(ProfileCompletionContext);

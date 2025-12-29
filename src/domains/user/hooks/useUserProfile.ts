import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ProfileViewModel, ProfileTabKey } from "../types";
import { PROFILE_ACCENT } from "../constants/profile";
import { profileMockData } from "../mockData";
import { fetchMoodboards } from "@/domains/artwork/services/moodboardService";

type UserDoc = {
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string | null;
  avatarUri?: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  countryCode?: string;
  followerCount?: number;
  followingCount?: number;
  profileCompleted?: boolean;
};

type UseUserProfileResult = {
  profile: ProfileViewModel;
  tab: ProfileTabKey;
  isLoading: boolean;
  error: Error | null;
  setTab: (tab: ProfileTabKey) => void;
  refetch: () => Promise<void>;
};

const buildDisplayName = (data: UserDoc): string => {
  const firstName = data.firstName?.trim() ?? "";
  const lastName = data.lastName?.trim() ?? "";
  const composed = [firstName, lastName].filter(Boolean).join(" ").trim();
  return composed || data.displayName || data.email || "User";
};

const buildHandle = (data: UserDoc, email: string, displayName: string): string => {
  const username = data.username?.trim().replace(/^@/, "") ?? "";
  const profileCompleted = Boolean(data.profileCompleted);
  const hasCustomProfile =
    profileCompleted ||
    Boolean(
      username ||
        data.firstName ||
        data.lastName ||
        data.phoneNumber ||
        data.address ||
        data.avatarUri
    );

  if (hasCustomProfile && username) {
    return `@${username}`;
  }

  return email || displayName;
};

const buildUserProfile = (data: UserDoc, userId: string): ProfileViewModel => {
  const email = data.email || "";
  const displayName = buildDisplayName(data);
  const avatarUri = data.avatarUri !== undefined ? data.avatarUri : data.photoURL ?? null;
  const avatarLabelSource = displayName || email || "?";

  return {
    ...profileMockData,
    user: {
      id: userId,
      name: displayName,
      handle: buildHandle(data, email, displayName),
      avatarUri,
      avatarLabel: avatarLabelSource.charAt(0).toUpperCase(),
      avatarColor: PROFILE_ACCENT,
    },
    stats: {
      followers: data.followerCount ?? 0,
      following: data.followingCount ?? 0,
    },
    featuredArtworks: [],
    moodboards: [],
  };
};

export function useUserProfile(userId: string): UseUserProfileResult {
  const [tab, setTab] = useState<ProfileTabKey>("overview");
  const [profile, setProfile] = useState<ProfileViewModel>({
    ...profileMockData,
    user: {
      ...profileMockData.user,
      id: userId,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userRef = doc(firestore, "users", userId);
      const [userSnap, moodboards] = await Promise.all([
        getDoc(userRef),
        fetchMoodboards(userId).catch(() => []),
      ]);

      if (!userSnap.exists()) {
        throw new Error("User not found");
      }

      const data = userSnap.data() as UserDoc;
      const userProfile = buildUserProfile(data, userId);
      userProfile.moodboards = moodboards.map((mb) => ({
        id: mb.id,
        title: mb.name,
        visibility: mb.isPrivate ? "private" : "public",
        ownerName: userProfile.user.name,
        ownerAvatar: userProfile.user.avatarUri ?? null,
        coverImage: mb.cover ?? null,
        itemsCount: mb.count,
      }));
      setProfile(userProfile);
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError(err instanceof Error ? err : new Error("Failed to load profile"));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchUserProfile();
  }, [fetchUserProfile]);

  return {
    profile,
    tab,
    isLoading,
    error,
    setTab,
    refetch: fetchUserProfile,
  };
}

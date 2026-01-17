import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc, serverTimestamp, setDoc, collection, getDocs, onSnapshot, documentId, query, where } from "firebase/firestore";
import { updateProfile as updateAuthProfile, type User } from "firebase/auth";

import { auth, firestore } from "@/configs/firebase";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { upsertUserProfile } from "@/domains/auth/services/userProfile";
import { toggleFollow as toggleFollowService } from "../services/followService";
import { isLocalUri, uploadIfLocal } from "@/shared/services/uploadService";
import { EDIT_PROFILE_DEFAULTS } from "../constants/editProfile";
import { PROFILE_ACCENT } from "../constants/profile";
import { profileMockData } from "../mockData";
import { EditProfileFormValues, ProfileViewModel, FollowUser } from "../types";
import { fetchMoodboards } from "@/domains/artwork/services/moodboardService";
import { useFeedContext } from "@/domains/feed/contexts/FeedContext";
import { updateUserPostsAuthorSnapshot } from "@/domains/feed/services/feedService";

type ProfileContextValue = {
  profile: ProfileViewModel;
  editProfile: EditProfileFormValues;
  isLoading: boolean;
  following: FollowUser[];
  updateProfile: (values: EditProfileFormValues) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
  resetProfile: () => void;
  refreshProfile: () => Promise<void>;
};

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
  profileCompleted?: boolean;
  stats?: {
    followers?: number;
    following?: number;
  };
};

const baseProfile: ProfileViewModel = {
  ...profileMockData,
  user: {
    ...profileMockData.user,
    id: "",
    name: "User",
    handle: "",
    avatarColor: PROFILE_ACCENT,
    avatarLabel: "U",
  },
  stats: {
    followers: 0,
    following: 0,
  },
  featuredArtworks: [],
  moodboards: [],
};

const buildDisplayName = (
  data: UserDoc,
  authUser: User | null
): string => {
  const firstName = data.firstName?.trim() ?? "";
  const lastName = data.lastName?.trim() ?? "";
  const composed = [firstName, lastName].filter(Boolean).join(" ").trim();
  return (
    composed ||
    data.displayName ||
    authUser?.displayName ||
    data.email ||
    authUser?.email ||
    "User"
  );
};

const buildHandle = (
  data: UserDoc,
  email: string,
  displayName: string
): string => {
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

const buildProfileFromUserDoc = (
  data: UserDoc,
  authUser: User | null,
  prev: ProfileViewModel
): ProfileViewModel => {
  const email = data.email || authUser?.email || "";
  const displayName = buildDisplayName(data, authUser);
  const avatarUri =
    data.avatarUri !== undefined
      ? data.avatarUri
      : data.photoURL ?? authUser?.photoURL ?? prev.user.avatarUri;
  const avatarLabelSource = displayName || email || prev.user.avatarLabel || "?";

  return {
    ...prev,
    user: {
      ...prev.user,
      id: data.uid || authUser?.uid || prev.user.id,
      name: displayName,
      handle: buildHandle(data, email, displayName),
      avatarUri,
      avatarLabel: avatarLabelSource.charAt(0).toUpperCase(),
      avatarColor: prev.user.avatarColor ?? PROFILE_ACCENT,
    },
    stats: {
      followers: data.stats?.followers ?? prev.stats.followers,
      following: data.stats?.following ?? prev.stats.following,
    },
  };
};

const buildEditProfileFromDoc = (
  data: UserDoc,
  profile: ProfileViewModel
): EditProfileFormValues => {
  const rawName = (data.displayName || profile.user.name || "").trim();
  const nameParts = rawName ? rawName.split(/\s+/) : [];
  const firstName =
    data.firstName?.trim() ?? nameParts.shift() ?? EDIT_PROFILE_DEFAULTS.firstName;
  const lastNameFromParts = nameParts.join(" ").trim();
  const lastName =
    (data.lastName?.trim() ?? "") ||
    lastNameFromParts ||
    EDIT_PROFILE_DEFAULTS.lastName;

  const handle = profile.user.handle || "";
  const username =
    data.username?.trim().replace(/^@/, "") ??
    (handle.startsWith("@") ? handle.replace(/^@/, "") : "");

  const avatar =
    data.avatarUri !== undefined
      ? data.avatarUri
      : typeof profile.user.avatarUri === "string"
        ? profile.user.avatarUri
        : undefined;

  return {
    ...EDIT_PROFILE_DEFAULTS,
    countryCode: data.countryCode ?? EDIT_PROFILE_DEFAULTS.countryCode,
    avatar,
    username,
    firstName,
    lastName,
    phoneNumber: data.phoneNumber ?? "",
    address: data.address ?? "",
  };
};

const buildProfileFromForm = (
  prev: ProfileViewModel,
  values: EditProfileFormValues
): ProfileViewModel => {
  const trimmedUsername = values.username?.trim() ?? "";
  const cleanUsername = trimmedUsername.replace(/^@/, "");
  const handle = cleanUsername ? `@${cleanUsername}` : prev.user.handle;
  const firstName = values.firstName?.trim() ?? "";
  const lastName = values.lastName?.trim() ?? "";
  const name =
    [firstName, lastName].filter(Boolean).join(" ") || prev.user.name;
  const avatarSource =
    values.avatar === null
      ? null
      : values.avatar?.trim()
        ? values.avatar
        : prev.user.avatarUri;
  const avatarLabelSource = name || cleanUsername || prev.user.avatarLabel || "?";

  return {
    ...prev,
    user: {
      ...prev.user,
      name,
      handle,
      avatarUri: avatarSource,
      avatarLabel: avatarLabelSource.charAt(0).toUpperCase(),
    },
  };
};

const defaultEditProfile = {
  ...EDIT_PROFILE_DEFAULTS,
};

const ProfileContext = createContext<ProfileContextValue>({
  profile: baseProfile,
  editProfile: defaultEditProfile,
  isLoading: true,
  following: [],
  updateProfile: async () => {},
  isFollowing: () => false,
  toggleFollow: () => {},
  resetProfile: () => {},
  refreshProfile: async () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, status, setCurrentUser } = useAuth();
  const { refreshFeed } = useFeedContext();
  const [profile, setProfile] = useState<ProfileViewModel>(baseProfile);
  const [editProfile, setEditProfile] = useState<EditProfileFormValues>(
    defaultEditProfile
  );
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    if (status !== "authenticated" || !currentUser) {
      setProfile(baseProfile);
      setEditProfile(defaultEditProfile);
      setFollowing([]);
      setFollowingIds(new Set());
      setIsLoading(false);
      return;
    }
    try {
      await upsertUserProfile(currentUser);

      const userRef = doc(firestore, "users", currentUser.uid);
      const [userSnap, moodboards] = await Promise.all([
        getDoc(userRef),
        fetchMoodboards(currentUser.uid).catch(() => []),
      ]);
      const data = (userSnap.data() ?? {}) as UserDoc;

      const nextProfile = buildProfileFromUserDoc(
        data,
        currentUser,
        baseProfile
      );
      nextProfile.moodboards = moodboards.map((mb) => ({
        id: mb.id,
        title: mb.name,
        visibility: mb.isPrivate ? "private" : "public",
        ownerName: nextProfile.user.name,
        ownerAvatar: nextProfile.user.avatarUri ?? null,
        coverImage: mb.cover ?? null,
        itemsCount: mb.count,
      }));
      setProfile(nextProfile);
      setEditProfile(buildEditProfileFromDoc(data, nextProfile));

      // Load following list and details
      const followingRef = collection(firestore, "users", currentUser.uid, "following");
      const followingSnap = await getDocs(followingRef);
      const ids = followingSnap.docs.map(d => d.id);
      setFollowingIds(new Set(ids));

      if (ids.length > 0) {
        // Chunk requests because "in" query limits to 10
        // Or simply fetch all one by one if easier (or optimize later)
        // For now, let's fetch documents by ID
        // Note: documentId() in query is powerful
        const usersRef = collection(firestore, "users");
        // We'll fetch in batches of 10
        const usersData: FollowUser[] = [];
        
        for (let i = 0; i < ids.length; i += 10) {
          const chunk = ids.slice(i, i + 10);
          const q = query(usersRef, where(documentId(), "in", chunk));
          const snap = await getDocs(q);
          snap.forEach((d) => {
            const uData = d.data();
            usersData.push({
              id: d.id,
              username: uData.username || "",
              displayName: uData.displayName || uData.name || "",
              avatarUrl: uData.photoURL || uData.avatarUri || undefined,
            });
          });
        }
        setFollowing(usersData);
      } else {
        setFollowing([]);
      }

    } catch (error) {
      console.warn("Failed to load profile:", error);
      setProfile(baseProfile);
      setEditProfile(defaultEditProfile);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, status]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  // Realtime sync for current user's profile doc to keep stats (followers/following) up to date
  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(firestore, "users", currentUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snap) => {
        // Skip realtime updates when we're actively updating profile to avoid conflicts
        if (isUpdatingProfile) return;

        const data = (snap.data() ?? {}) as UserDoc;
        setProfile((prev) =>
          buildProfileFromUserDoc(
            data,
            currentUser,
            { ...prev, moodboards: prev.moodboards }
          )
        );
      },
      (err) => {
        console.warn("Profile snapshot error:", err);
      }
    );
    return () => unsubscribe();
  }, [currentUser, isUpdatingProfile]);

  const updateProfile = useCallback(
    async (values: EditProfileFormValues) => {
      if (!currentUser) {
        setEditProfile(values);
        setProfile((prev) => buildProfileFromForm(prev, values));
        return;
      }

      // Set flag to prevent realtime listener from interfering
      setIsUpdatingProfile(true);

      try {
        await upsertUserProfile(currentUser);
        const userRef = doc(firestore, "users", currentUser.uid);

        const usernameInput = values.username?.trim() ?? "";
        const username = usernameInput.replace(/^@/, "");
        const firstName = values.firstName?.trim() ?? "";
        const lastName = values.lastName?.trim() ?? "";
        const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();
        let avatarUri = values.avatar;

        if (typeof avatarUri === "string" && isLocalUri(avatarUri)) {
          avatarUri = await uploadIfLocal(avatarUri, "avatars");
        }

        const nextValues = { ...values, avatar: avatarUri };

        const payload: Record<string, any> = {
          username,
          firstName,
          lastName,
          phoneNumber: values.phoneNumber?.trim() ?? "",
          address: values.address?.trim() ?? "",
          countryCode: values.countryCode,
          updatedAt: serverTimestamp(),
        };

        if (values.avatar !== undefined) {
          payload.avatarUri = avatarUri;
        }

        if (displayName) {
          payload.displayName = displayName;
        }

        await setDoc(userRef, payload, { merge: true });

        const authUser = auth.currentUser;
        const authUpdates: { displayName?: string | null; photoURL?: string | null } = {};
        if (displayName) {
          authUpdates.displayName = displayName;
        }
        if (values.avatar !== undefined) {
          authUpdates.photoURL = avatarUri ?? null;
        }
        if (authUser && Object.keys(authUpdates).length > 0) {
          try {
            await updateAuthProfile(authUser, authUpdates);
            await authUser.reload();
            setCurrentUser({ ...authUser });
          } catch (error) {
            console.warn("Failed to sync auth profile:", error);
          }
        }

        // Build the new profile values using the same logic as buildProfileFromForm
        const updatedProfile = buildProfileFromForm(profile, nextValues);

        setEditProfile(nextValues);
        setProfile(updatedProfile);

        // Update authorSnapshot in all user's posts with the exact same data
        // IMPORTANT: Remove @ prefix from handle to match the format in useFeed authorSnapshot
        const handleForSnapshot = updatedProfile.user.handle.startsWith("@")
          ? updatedProfile.user.handle.slice(1)
          : updatedProfile.user.handle;

        const newAuthorSnapshot = {
          id: currentUser.uid,
          name: updatedProfile.user.name,
          handle: handleForSnapshot,
          avatar: updatedProfile.user.avatarUri || undefined,
        };

        try {
          await updateUserPostsAuthorSnapshot(currentUser.uid, newAuthorSnapshot);
        } catch (error) {
          console.warn("Failed to update posts author snapshot:", error);
        }

        // Refresh feed to update posts with new profile info
        await refreshFeed();
      } finally {
        // Re-enable realtime listener
        setIsUpdatingProfile(false);
      }
    },
    [currentUser, setCurrentUser, refreshFeed, profile]
  );

  const isFollowing = useCallback((userId: string) => {
    return followingIds.has(userId);
  }, [followingIds]);

  const toggleFollow = useCallback(async (userId: string) => {
    if (!currentUser) return;

    // Optimistic update
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });

    try {
      await toggleFollowService(currentUser.uid, userId);
      // Optional: Refresh full profile/following list after follow action
      // to update the suggested list. For now, we rely on optimistic ID update only for isFollowing check
      // Ideally, we should also fetch the user details and add to `following` state here.
    } catch (error) {
      console.error("Failed to toggle follow in context:", error);
      // Revert if failed
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (next.has(userId)) {
          next.delete(userId);
        } else {
          next.add(userId);
        }
        return next;
      });
    }
  }, [currentUser]);

  const resetProfile = useCallback(() => {
    setProfile(baseProfile);
    setEditProfile(defaultEditProfile);
    setFollowingIds(new Set());
    setFollowing([]);
    setIsLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      editProfile,
      isLoading,
      following,
      updateProfile,
      isFollowing,
      toggleFollow,
      resetProfile,
      refreshProfile,
    }),
    [profile, editProfile, isLoading, following, updateProfile, isFollowing, toggleFollow, resetProfile, refreshProfile]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileContext = () => useContext(ProfileContext);

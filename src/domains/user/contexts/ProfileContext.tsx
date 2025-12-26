import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { doc, getDoc, serverTimestamp, setDoc, collection, getDocs, onSnapshot } from "firebase/firestore";
import { updateProfile as updateAuthProfile, type User } from "firebase/auth";

import { auth, firestore } from "@/configs/firebase";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { upsertUserProfile } from "@/domains/auth/services/userProfile";
import { toggleFollow as toggleFollowService } from "../services/followService";
import { EDIT_PROFILE_DEFAULTS } from "../constants/editProfile";
import { PROFILE_ACCENT } from "../constants/profile";
import { profileMockData } from "../mockData";
import { EditProfileFormValues, ProfileViewModel } from "../types";

type ProfileContextValue = {
  profile: ProfileViewModel;
  editProfile: EditProfileFormValues;
  isLoading: boolean;
  updateProfile: (values: EditProfileFormValues) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => void;
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
  updateProfile: async () => {},
  isFollowing: () => false,
  toggleFollow: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, status, setCurrentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileViewModel>(baseProfile);
  const [editProfile, setEditProfile] = useState<EditProfileFormValues>(
    defaultEditProfile
  );
  const [isLoading, setIsLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    if (status !== "authenticated" || !currentUser) {
      setProfile(baseProfile);
      setEditProfile(defaultEditProfile);
      setIsLoading(false);
      return;
    }
    try {
      await upsertUserProfile(currentUser);

      const userRef = doc(firestore, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      const data = (userSnap.data() ?? {}) as UserDoc;

      const nextProfile = buildProfileFromUserDoc(
        data,
        currentUser,
        baseProfile
      );
      setProfile(nextProfile);
      setEditProfile(buildEditProfileFromDoc(data, nextProfile));

      // Load following list
      const followingRef = collection(firestore, "users", currentUser.uid, "following");
      const followingSnap = await getDocs(followingRef);
      const ids = new Set(followingSnap.docs.map(d => d.id));
      setFollowingIds(ids);

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
        const data = (snap.data() ?? {}) as UserDoc;
        const nextProfile = buildProfileFromUserDoc(
          data,
          currentUser,
          baseProfile
        );
        setProfile(nextProfile);
      },
      (err) => {
        console.warn("Profile snapshot error:", err);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const updateProfile = useCallback(
    async (values: EditProfileFormValues) => {
      if (!currentUser) {
        setEditProfile(values);
        setProfile((prev) => buildProfileFromForm(prev, values));
        return;
      }

      await upsertUserProfile(currentUser);
      const userRef = doc(firestore, "users", currentUser.uid);

      const usernameInput = values.username?.trim() ?? "";
      const username = usernameInput.replace(/^@/, "");
      const firstName = values.firstName?.trim() ?? "";
      const lastName = values.lastName?.trim() ?? "";
      const displayName = [firstName, lastName].filter(Boolean).join(" ").trim();

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
        payload.avatarUri = values.avatar;
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
        authUpdates.photoURL = values.avatar ?? null;
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

      setEditProfile(values);
      setProfile((prev) => buildProfileFromForm(prev, values));
    },
    [currentUser, setCurrentUser]
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

  const value = useMemo(
    () => ({
      profile,
      editProfile,
      isLoading,
      updateProfile,
      isFollowing,
      toggleFollow,
    }),
    [profile, editProfile, isLoading, updateProfile, isFollowing, toggleFollow]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileContext = () => useContext(ProfileContext);

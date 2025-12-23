import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EDIT_PROFILE_DEFAULTS } from "../constants/editProfile";
import { profileMockData } from "../mockData";
import { EditProfileFormValues, ProfileViewModel } from "../types";

type ProfileContextValue = {
  profile: ProfileViewModel;
  editProfile: EditProfileFormValues;
  updateProfile: (values: EditProfileFormValues) => void;
  followingIds: string[];
  isFollowing: (id: string) => boolean;
  followUser: (id: string) => void;
  unfollowUser: (id: string) => void;
  toggleFollow: (id: string) => void;
};

const buildEditProfileFromProfile = (
  profile: ProfileViewModel
): EditProfileFormValues => {
  const rawName = profile.user.name?.trim() ?? "";
  const nameParts = rawName ? rawName.split(/\s+/) : [];
  const firstName = nameParts.shift() ?? EDIT_PROFILE_DEFAULTS.firstName;
  const lastName = nameParts.join(" ") || EDIT_PROFILE_DEFAULTS.lastName;
  const username =
    profile.user.handle?.replace(/^@/, "") ?? EDIT_PROFILE_DEFAULTS.username;

  return {
    ...EDIT_PROFILE_DEFAULTS,
    avatar: profile.user.avatarUri ?? undefined,
    username,
    firstName,
    lastName,
  };
};

const buildProfileFromForm = (
  prev: ProfileViewModel,
  values: EditProfileFormValues
): ProfileViewModel => {
  const trimmedUsername = values.username?.trim() ?? "";
  const handle = trimmedUsername
    ? trimmedUsername.startsWith("@")
      ? trimmedUsername
      : `@${trimmedUsername}`
    : prev.user.handle;
  const firstName = values.firstName?.trim() ?? "";
  const lastName = values.lastName?.trim() ?? "";
  const name =
    [firstName, lastName].filter(Boolean).join(" ") || prev.user.name;
  const avatarSource =
    values.avatar === null
      ? null
      : values.avatar?.trim()
        ? values.avatar
        : undefined;
  const avatarLabelSource =
    name || trimmedUsername || prev.user.avatarLabel || "?";

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

const defaultProfile = profileMockData;
const defaultEditProfile = buildEditProfileFromProfile(defaultProfile);
const defaultFollowingIds: string[] = ["follow-1", "follow-2"];

const ProfileContext = createContext<ProfileContextValue>({
  profile: defaultProfile,
  editProfile: defaultEditProfile,
  updateProfile: () => {},
  followingIds: defaultFollowingIds,
  isFollowing: () => false,
  followUser: () => {},
  unfollowUser: () => {},
  toggleFollow: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileViewModel>(defaultProfile);
  const [editProfile, setEditProfile] = useState<EditProfileFormValues>(
    defaultEditProfile
  );
  const [followingIds, setFollowingIds] = useState<string[]>(
    defaultFollowingIds
  );

  const updateProfile = useCallback((values: EditProfileFormValues) => {
    setEditProfile(values);
    setProfile((prev) => buildProfileFromForm(prev, values));
  }, []);

  const isFollowing = useCallback(
    (id: string) => followingIds.includes(id),
    [followingIds]
  );

  const followUser = useCallback((id: string) => {
    setFollowingIds((prev) => {
      if (prev.includes(id)) return prev;
      setProfile((prevProfile) => ({
        ...prevProfile,
        stats: {
          ...prevProfile.stats,
          following: prevProfile.stats.following + 1,
        },
      }));
      return [...prev, id];
    });
  }, []);

  const unfollowUser = useCallback((id: string) => {
    setFollowingIds((prev) => {
      if (!prev.includes(id)) return prev;
      setProfile((prevProfile) => ({
        ...prevProfile,
        stats: {
          ...prevProfile.stats,
          following: Math.max(prevProfile.stats.following - 1, 0),
        },
      }));
      return prev.filter((item) => item !== id);
    });
  }, []);

  const toggleFollow = useCallback(
    (id: string) => {
      setFollowingIds((prev) => {
        const isCurrentlyFollowing = prev.includes(id);
        if (isCurrentlyFollowing) {
          setProfile((prevProfile) => ({
            ...prevProfile,
            stats: {
              ...prevProfile.stats,
              following: Math.max(prevProfile.stats.following - 1, 0),
            },
          }));
          return prev.filter((item) => item !== id);
        } else {
          setProfile((prevProfile) => ({
            ...prevProfile,
            stats: {
              ...prevProfile.stats,
              following: prevProfile.stats.following + 1,
            },
          }));
          return [...prev, id];
        }
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      profile,
      editProfile,
      updateProfile,
      followingIds,
      isFollowing,
      followUser,
      unfollowUser,
      toggleFollow,
    }),
    [
      profile,
      editProfile,
      updateProfile,
      followingIds,
      isFollowing,
      followUser,
      unfollowUser,
      toggleFollow,
    ]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileContext = () => useContext(ProfileContext);

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { EDIT_PROFILE_DEFAULTS } from "../constants/editProfile";
import { profileMockData } from "../mockData";
import { EditProfileFormValues, ProfileViewModel } from "../types";

type ProfileContextValue = {
  profile: ProfileViewModel;
  editProfile: EditProfileFormValues;
  updateProfile: (values: EditProfileFormValues) => void;
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

const ProfileContext = createContext<ProfileContextValue>({
  profile: defaultProfile,
  editProfile: defaultEditProfile,
  updateProfile: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<ProfileViewModel>(defaultProfile);
  const [editProfile, setEditProfile] = useState<EditProfileFormValues>(
    defaultEditProfile
  );

  const updateProfile = useCallback((values: EditProfileFormValues) => {
    setEditProfile(values);
    setProfile((prev) => buildProfileFromForm(prev, values));
  }, []);

  const value = useMemo(
    () => ({
      profile,
      editProfile,
      updateProfile,
    }),
    [profile, editProfile, updateProfile]
  );

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfileContext = () => useContext(ProfileContext);

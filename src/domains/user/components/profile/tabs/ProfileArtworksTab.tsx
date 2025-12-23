import React from "react";
import { View } from "react-native";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";

type Props = {
  profile: ProfileViewModel;
};

export default function ProfileArtworksTab({ profile }: Props) {
  const empty = profile.featuredArtworks.length === 0;

  return (
    <View className="pt-3">
      {empty ? (
        <ProfileEmptyState message={PROFILE_STRINGS.artworksEmpty} />
      ) : (
        <View />
      )}
    </View>
  );
}

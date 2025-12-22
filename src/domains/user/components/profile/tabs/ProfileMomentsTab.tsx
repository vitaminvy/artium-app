import React from "react";
import { View } from "react-native";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";

type Props = {
  profile: ProfileViewModel;
};

export default function ProfileMomentsTab({ profile }: Props) {
  const hasMoments = false; // Skeleton state

  return (
    <View className="pt-3">
      {hasMoments ? (
        <View />
      ) : (
        <ProfileEmptyState message={PROFILE_STRINGS.momentsEmpty} />
      )}
    </View>
  );
}

import React from "react";
import { View } from "react-native";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";

type Props = {
  profile: ProfileViewModel;
  onPressUpload?: () => void;
};

export default function ProfileMomentsTab({ profile, onPressUpload }: Props) {
  const hasMoments = false; // Skeleton state

  return (
    <View className="pt-3">
      {hasMoments ? (
        <View />
      ) : (
        <ProfileEmptyState
          message={PROFILE_STRINGS.momentsEmpty}
          onPress={onPressUpload}
        />
      )}
    </View>
  );
}

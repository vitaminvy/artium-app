import React from "react";
import { View } from "react-native";
import { ProfileMoodboard, ProfileViewModel } from "../../../types";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import MoodboardCard from "../MoodboardCard";
import MasonryLayout from "../../../../../shared/components/MasonryLayout";

type Props = {
  profile: ProfileViewModel;
  onPressMoodboard?: (moodboard: ProfileMoodboard) => void;
};

export default function ProfileMoodboardsTab({ profile, onPressMoodboard }: Props) {
  if (!profile.moodboards.length) {
    return (
      <View className="pt-3">
        <ProfileEmptyState message={PROFILE_STRINGS.moodboardsEmpty} />
      </View>
    );
  }

  return (
    <View className="pt-3 pb-6">
      <MasonryLayout
        data={profile.moodboards}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnGap={12}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 12 }}
        renderItem={(item, index) => (
          <View style={{ marginBottom: 16 }}>
            <MoodboardCard
              moodboard={item}
              onPress={onPressMoodboard ? () => onPressMoodboard(item) : undefined}
            />
          </View>
        )}
      />
    </View>
  );
}

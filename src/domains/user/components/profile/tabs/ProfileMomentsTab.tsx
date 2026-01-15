import React from "react";
import { View } from "react-native";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";
import MasonryLayout from "../../../../../shared/components/MasonryLayout";
import MasonryMomentCard from "../MasonryMomentCard";
import { useOwnerMoments } from "../../../hooks/useOwnerMoments";

type Props = {
  profile: ProfileViewModel;
  onPressUpload?: () => void;
  onPressMoment?: (momentId: string) => void;
};

export default function ProfileMomentsTab({ profile, onPressUpload, onPressMoment }: Props) {
  const { moments, loading } = useOwnerMoments();

  if (loading) {
    return (
      <View className="pt-3">
        <View className="px-4 py-20">
          <View className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
        </View>
      </View>
    );
  }

  if (moments.length === 0) {
    return (
      <View className="pt-3">
        <ProfileEmptyState
          message={PROFILE_STRINGS.momentsEmpty}
          onPress={onPressUpload}
        />
      </View>
    );
  }

  return (
    <View className="pt-3">
      <MasonryLayout
        data={moments}
        numColumns={2}
        columnGap={8}
        keyExtractor={(item) => item.id}
        renderItem={(moment) => (
          <MasonryMomentCard
            item={moment}
            onPress={() => onPressMoment?.(moment.id)}
            onPressAuthor={() => {}}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

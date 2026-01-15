import React from "react";
import { View, Text } from "react-native";
import MasonryLayout from "../../../../../shared/components/MasonryLayout";
import MasonryMomentCard, { MasonryMomentItem } from "../MasonryMomentCard";

type Props = {
  moments?: MasonryMomentItem[];
  onPressMoment?: (momentId: string) => void;
};

export default function UserProfileMomentsTab({
  moments = [],
  onPressMoment,
}: Props) {
  if (moments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-sm text-slate-500">No moments yet</Text>
      </View>
    );
  }

  return (
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
  );
}

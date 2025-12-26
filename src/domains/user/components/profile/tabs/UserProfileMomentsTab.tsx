import React from "react";
import { View, Text, ScrollView } from "react-native";
import MomentCard, { MomentCardItem } from "../MomentCard";

type Props = {
  moments?: MomentCardItem[];
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
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 20 }}
    >
      {moments.map((moment) => (
        <MomentCard
          key={moment.id}
          item={moment}
          onPress={() => onPressMoment?.(moment.id)}
          onPressAuthor={() => {}}
        />
      ))}
    </ScrollView>
  );
}

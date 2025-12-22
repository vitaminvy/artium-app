import React from "react";
import { View, Text, Pressable } from "react-native";
import ProfileSection from "../ProfileSection";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";

type Props = {
  profile: ProfileViewModel;
  onPressUpload?: () => void;
  onPressShare?: () => void;
};

export default function ProfileOverviewTab({
  profile,
  onPressUpload,
  onPressShare,
}: Props) {
  return (
    <View className="pt-1">
      <ProfileSection
        title={PROFILE_STRINGS.featuredTitle}
        actions={[{ label: "+ Upload", tone: "primary", onPress: onPressUpload }]}
      >
        <View className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-6 items-center">
          <Text className="text-sm text-center text-slate-500">
            {PROFILE_STRINGS.featuredDescription}
          </Text>

          <Pressable
            className="mt-5 rounded-full border border-slate-200 bg-white px-6 py-3"
            style={{ shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6 }}
          >
            <Text className="text-sm font-semibold text-slate-800">
              {PROFILE_STRINGS.storefrontCta}
            </Text>
          </Pressable>
        </View>
      </ProfileSection>

      <ProfileSection
        title={PROFILE_STRINGS.momentsTitle}
        actions={[{ label: "+ Share", tone: "primary", onPress: onPressShare }]}
      >
        <ProfileEmptyState message={PROFILE_STRINGS.momentsEmpty} />
      </ProfileSection>
    </View>
  );
}

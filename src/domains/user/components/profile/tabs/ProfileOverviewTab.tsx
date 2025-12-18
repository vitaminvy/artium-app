import React from "react";
import { View, Text, Pressable } from "react-native";
import ProfileSection from "../ProfileSection";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";

type Props = {
  profile: ProfileViewModel;
};

export default function ProfileOverviewTab({ profile }: Props) {
  return (
    <View className="pt-1">
      <ProfileSection
        title={PROFILE_STRINGS.featuredTitle}
        actions={[
          { label: "Manage", tone: "muted" },
          { label: "+ Upload", tone: "primary" },
        ]}
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
        actions={[{ label: "+ Share", tone: "primary" }]}
      >
        <ProfileEmptyState message={PROFILE_STRINGS.momentsEmpty} />
      </ProfileSection>
    </View>
  );
}

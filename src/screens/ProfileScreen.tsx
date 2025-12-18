import React from "react";
import { View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ProfileHeader from "../domains/user/components/profile/ProfileHeader";
import ProfileHero from "../domains/user/components/profile/ProfileHero";
import ProfileActionButtons from "../domains/user/components/profile/ProfileActionButtons";
import ProfileTabBar from "../domains/user/components/profile/ProfileTabBar";
import ProfileOverviewTab from "../domains/user/components/profile/tabs/ProfileOverviewTab";
import ProfileArtworksTab from "../domains/user/components/profile/tabs/ProfileArtworksTab";
import ProfileMomentsTab from "../domains/user/components/profile/tabs/ProfileMomentsTab";
import ProfileMoodboardsTab from "../domains/user/components/profile/tabs/ProfileMoodboardsTab";
import { useProfile } from "../domains/user/hooks/useProfile";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, tab, setTab } = useProfile();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const openEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  return (
    <View className="flex-1 bg-white">
      <ProfileHeader onPressBack={handleBack} onPressMenu={() => {}} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <ProfileHero user={profile.user} stats={profile.stats} />
        <ProfileActionButtons onPressEdit={openEditProfile} />
        <ProfileTabBar tab={tab} onChange={setTab} />

        <View className="px-1 pb-4">
          {tab === "overview" && <ProfileOverviewTab profile={profile} />}
          {tab === "artworks" && <ProfileArtworksTab profile={profile} />}
          {tab === "moments" && <ProfileMomentsTab profile={profile} />}
          {tab === "moodboards" && <ProfileMoodboardsTab profile={profile} />}
        </View>
      </ScrollView>
    </View>
  );
}

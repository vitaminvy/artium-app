import React, { useCallback } from "react";
import { View, ScrollView } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import Sidebar from "../shared/components/Sidebar";
import { useSidebarItems, SidebarKey } from "../shared/hooks/useSidebar";
import { requestPostMomentSheet } from "../shared/utils/postMomentBridge";
import { navigate as rootNavigate } from "../app/navigation/navigationRef";
import { useProfileCompletion } from "../domains/user/contexts/ProfileCompletionContext";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "Profile"
>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, tab, setTab } = useProfile();
  const { loading: profileStatusLoading, profileCompleted } =
    useProfileCompletion();
  const sidebarItems = useSidebarItems();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [headerHeight, setHeaderHeight] = React.useState(96);
  const [activeKey, setActiveKey] = React.useState<SidebarKey>("profile");

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const openEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleShare = () => {
    requestPostMomentSheet();
  };

  const handleUploadInventory = () => {
    rootNavigate("Upload");
  };

  const handleSidebarSelect = (key: SidebarKey | "more") => {
    setSidebarOpen(false);

    if (key === "home") {
      if (navigation.popToTop) {
        navigation.popToTop();
      } else {
        navigation.navigate("HomeMain");
      }
      return;
    }

    if (key === "inventory") {
      navigation.navigate("Inventory");
      return;
    }

    if (key === "profile") return;

    console.log("Sidebar selected:", key);
  };

  useFocusEffect(
    useCallback(() => {
      setActiveKey("profile");
    }, [setActiveKey])
  );

  useFocusEffect(
    useCallback(() => {
      if (!profileStatusLoading && !profileCompleted) {
        navigation.navigate("EditProfile");
      }
    }, [navigation, profileCompleted, profileStatusLoading])
  );

  return (
    <View className="flex-1 bg-white">
      <ProfileHeader
        onPressBack={handleBack}
        onPressMenu={() => setSidebarOpen((prev) => !prev)}
        onLayout={(e: any) => setHeaderHeight(e.nativeEvent.layout.height)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <ProfileHero user={profile.user} stats={profile.stats} />
        <ProfileActionButtons
          onPressEdit={openEditProfile}
          onPressShare={handleShare}
        />
        <ProfileTabBar tab={tab} onChange={setTab} />

        <View className="px-1 pb-4">
          {tab === "overview" && (
            <ProfileOverviewTab
              profile={profile}
              onPressUpload={handleUploadInventory}
              onPressShare={handleShare}
            />
          )}
          {tab === "artworks" && <ProfileArtworksTab profile={profile} />}
          {tab === "moments" && <ProfileMomentsTab profile={profile} />}
          {tab === "moodboards" && <ProfileMoodboardsTab profile={profile} />}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={sidebarItems}
      />
    </View>
  );
}

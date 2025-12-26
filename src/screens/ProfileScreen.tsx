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
import {
  SidebarActionKey,
  useSidebarItems,
  SidebarKey,
} from "../shared/hooks/useSidebar";
import { requestPostMomentSheet } from "../shared/utils/postMomentBridge";
import { shareProfile } from "../shared/utils/shareProfile";
import { navigate as rootNavigate } from "../app/navigation/navigationRef";
import { useProfileCompletion } from "../domains/user/contexts/ProfileCompletionContext";
import { useLogout } from "../domains/auth/hooks/useLogout";
import { LogoutConfirmModal } from "../domains/auth/components/LogoutConfirmModal";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "Profile"
>;

// ... imports

const ProfileSkeleton = () => (
  <View className="animate-pulse">
    {/* Hero Section */}
    <View className="items-center px-4 pt-2 pb-6">
      <View className="h-[88px] w-[88px] rounded-full bg-slate-200 mb-4" />
      <View className="h-6 w-40 rounded bg-slate-200 mb-2" />
      <View className="h-4 w-24 rounded bg-slate-200 mb-6" />
      
      {/* Stats */}
      <View className="flex-row items-center gap-8 mb-6">
        <View className="items-center gap-1">
          <View className="h-5 w-8 rounded bg-slate-200" />
          <View className="h-3 w-12 rounded bg-slate-200" />
        </View>
        <View className="h-8 w-[1px] bg-slate-200" />
        <View className="items-center gap-1">
          <View className="h-5 w-8 rounded bg-slate-200" />
          <View className="h-3 w-12 rounded bg-slate-200" />
        </View>
      </View>
    </View>

    {/* Action Buttons */}
    <View className="flex-row px-4 gap-3 mb-8">
      <View className="flex-1 h-10 rounded-full bg-slate-200" />
      <View className="flex-1 h-10 rounded-full bg-slate-200" />
    </View>

    {/* Tab Bar */}
    <View className="flex-row border-b border-slate-100 px-4 mb-4">
      <View className="mr-6 pb-3 border-b-2 border-slate-200">
        <View className="h-4 w-16 rounded bg-slate-200" />
      </View>
      <View className="mr-6 pb-3">
        <View className="h-4 w-16 rounded bg-slate-200" />
      </View>
      <View className="pb-3">
        <View className="h-4 w-16 rounded bg-slate-200" />
      </View>
    </View>

    {/* Grid Content */}
    <View className="flex-row flex-wrap px-1">
      <View className="w-1/2 p-1">
        <View className="aspect-[4/5] rounded-xl bg-slate-200" />
      </View>
      <View className="w-1/2 p-1">
        <View className="aspect-[4/5] rounded-xl bg-slate-200" />
      </View>
    </View>
  </View>
);

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, tab, setTab, isLoading } = useProfile();
  const { loading: profileStatusLoading, profileCompleted, promptDismissed } =
    useProfileCompletion();
  const sidebarItems = useSidebarItems();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [headerHeight, setHeaderHeight] = React.useState(96);
  const [activeKey, setActiveKey] = React.useState<SidebarKey>("profile");
  const {
    logout,
    loading: logoutLoading,
    showConfirmModal,
    onConfirmLogout,
    onCancelLogout,
  } = useLogout();

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const openEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const handleShare = async () => {
    await shareProfile(profile);
  };

  const handlePostMoment = () => {
    requestPostMomentSheet();
  };

  const handleUploadInventory = () => {
    rootNavigate("Upload");
  };

  const handleSidebarSelect = (key: SidebarActionKey) => {
    setSidebarOpen(false);

    if (key === "logout") {
      logout();
      return;
    }

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

    if (key === "events") {
      navigation.navigate("Events");
      return;
    }

    if (key === "profile") return;
    
    // console.log("Sidebar selected:", key);
  };

  useFocusEffect(
    useCallback(() => {
      setActiveKey("profile");
    }, [setActiveKey])
  );

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !profileStatusLoading && !profileCompleted && !promptDismissed) {
        navigation.navigate("EditProfile");
      }
    }, [navigation, profileCompleted, profileStatusLoading, promptDismissed, isLoading])
  );

  return (
    <View className="flex-1 bg-white">
      <ProfileHeader
        onPressBack={handleBack}
        onPressMenu={() => setSidebarOpen((prev) => !prev)}
        isMenuOpen={sidebarOpen}
        onLayout={(e: any) => setHeaderHeight(e.nativeEvent.layout.height)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
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
                  onPressShare={handlePostMoment}
                />
              )}
              {tab === "artworks" && <ProfileArtworksTab profile={profile} />}
              {tab === "moments" && (
                <ProfileMomentsTab
                  profile={profile}
                  onPressUpload={handlePostMoment}
                />
              )}
              {tab === "moodboards" && <ProfileMoodboardsTab profile={profile} />}
            </View>
          </>
        )}
      </ScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={sidebarItems}
      />

      <LogoutConfirmModal
        visible={showConfirmModal}
        onConfirm={onConfirmLogout}
        onCancel={onCancelLogout}
        loading={logoutLoading}
      />
    </View>
  );
}

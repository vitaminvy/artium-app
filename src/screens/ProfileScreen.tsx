import React, { useCallback } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
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
import { useOwnerMoments } from "../domains/user/hooks/useOwnerMoments";
import { useOwnerArtworks } from "../domains/user/hooks/useOwnerArtworks";
import { ProfileMoodboard } from "../domains/user/types";
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
  const { profile, tab, setTab, isLoading, refreshProfile } = useProfile();
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
  const [avatarLoaded, setAvatarLoaded] = React.useState(false);

  // Fetch owner data for navigation and display
  const { moments, refresh: refreshMoments } = useOwnerMoments();
  const { artworks, refresh: refreshArtworks } = useOwnerArtworks();
  const [refreshing, setRefreshing] = React.useState(false);

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

  const handlePressArtwork = (artworkId: string) => {
    console.log("Navigate to artwork:", artworkId);
    navigation.navigate("ArtworkDetail", { id: artworkId });
  };

  const handlePressMoment = (momentId: string) => {
    console.log("Navigate to moment:", momentId);
    // Find the full moment object from the moments array
    const moment = moments.find((m) => m.id === momentId);
    if (!moment) {
      console.warn("Moment not found:", momentId);
      return;
    }

    // Convert MomentCardItem to FeedPost
    const feedPost = {
      id: moment.id,
      author: moment.author,
      content: moment.content,
      createdAt: moment.createdAt || Date.now(),
      relativeTime: moment.relativeTime,
      media: moment.media,
      metrics: moment.metrics || { likes: 0, comments: 0, shares: 0 },
      liked: moment.liked,
    };

    navigation.navigate("FeedDetail", { post: feedPost });
  };

  const handleSeeAllArtworks = () => {
    setTab("artworks");
  };

  const handleSeeAllMoments = () => {
    setTab("moments");
  };

  const openMoodboardDetail = (moodboard: ProfileMoodboard) => {
    navigation.navigate("MoodboardDetail", {
      id: moodboard.id,
      ownerId: profile.user.id,
      title: moodboard.title,
      cover: moodboard.coverImage ?? undefined,
      ownerName: moodboard.ownerName,
    });
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

    if (key === "notifications") {
      navigation.navigate("Notifications" as never);
      return;
    }

    if (key === "invoices") {
      navigation.navigate("Invoices");
      return;
    }

    if (key === "profile") return;
    
    // console.log("Sidebar selected:", key);
  };

  useFocusEffect(
    useCallback(() => {
      setActiveKey("profile");
      // Refresh data when screen comes into focus
      refreshMoments();
      refreshArtworks();
    }, [setActiveKey, refreshMoments, refreshArtworks])
  );

  useFocusEffect(
    useCallback(() => {
      if (!isLoading && !profileStatusLoading && !profileCompleted && !promptDismissed) {
        navigation.navigate("EditProfile");
      }
    }, [navigation, profileCompleted, profileStatusLoading, promptDismissed, isLoading])
  );

  React.useEffect(() => {
    if (isLoading) {
      setAvatarLoaded(false);
      return;
    }
    if (!profile.user.avatarUri) {
      setAvatarLoaded(true);
      return;
    }
    setAvatarLoaded(false);
  }, [isLoading, profile.user.avatarUri]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), refreshMoments(), refreshArtworks()]);
    } catch (err) {
      console.warn("Failed to refresh profile", err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshArtworks, refreshMoments, refreshProfile]);

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <>
            <ProfileHero
              user={profile.user}
              stats={profile.stats}
              onAvatarLoad={() => setAvatarLoaded(true)}
              onPressFollowers={() => navigation.navigate("Follows", { type: "followers" })}
              onPressFollowing={() => navigation.navigate("Follows", { type: "following" })}
            />
            <ProfileActionButtons
              onPressEdit={openEditProfile}
              onPressShare={handleShare}
            />
            <ProfileTabBar tab={tab} onChange={setTab} />

            <View className="px-1 pb-4">
              {tab === "overview" && (
                <ProfileOverviewTab
                  profile={profile}
                  artworks={artworks}
                  moments={moments}
                  onPressUpload={handleUploadInventory}
                  onPressShare={handlePostMoment}
                  onPressSeeAllArtworks={handleSeeAllArtworks}
                  onPressSeeAllMoments={handleSeeAllMoments}
                  onPressSeeAllMoodboards={() => setTab("moodboards")}
                  onPressArtwork={handlePressArtwork}
                  onPressMoment={handlePressMoment}
                  onPressMoodboard={openMoodboardDetail}
                />
              )}
              {tab === "artworks" && (
                <ProfileArtworksTab
                  profile={profile}
                  onPressArtwork={handlePressArtwork}
                />
              )}
              {tab === "moments" && (
                <ProfileMomentsTab
                  profile={profile}
                  onPressUpload={handlePostMoment}
                  onPressMoment={handlePressMoment}
                />
              )}
              {tab === "moodboards" && (
                <ProfileMoodboardsTab
                  profile={profile}
                  onPressMoodboard={openMoodboardDetail}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>

      {!isLoading && !avatarLoaded ? (
        <View
          className="absolute left-0 right-0 bottom-0 bg-white"
          style={{ top: headerHeight, zIndex: 2 }}
          pointerEvents="none"
        >
          <ProfileSkeleton />
        </View>
      ) : null}

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

import React from "react";
import { View, ScrollView, Text } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import UserProfileHeader from "../domains/user/components/profile/UserProfileHeader";
import ProfileHero from "../domains/user/components/profile/ProfileHero";
import UserProfileActionButtons from "../domains/user/components/profile/UserProfileActionButtons";
import ProfileTabBar from "../domains/user/components/profile/ProfileTabBar";
import UserProfileOverviewTab from "../domains/user/components/profile/tabs/UserProfileOverviewTab";
import UserProfileArtworksTab from "../domains/user/components/profile/tabs/UserProfileArtworksTab";
import UserProfileMomentsTab from "../domains/user/components/profile/tabs/UserProfileMomentsTab";
import ProfileMoodboardsTab from "../domains/user/components/profile/tabs/ProfileMoodboardsTab";
import { useUserProfile } from "../domains/user/hooks/useUserProfile";
import { useUserArtworks } from "../domains/user/hooks/useUserArtworks";
import { useUserMoments } from "../domains/user/hooks/useUserMoments";
import { useProfileContext } from "../domains/user/contexts/ProfileContext";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { shareProfile } from "../shared/utils/shareProfile";
import { ProfileMoodboard } from "../domains/user/types";

type UserProfileRouteProp = RouteProp<HomeStackParamList, "UserProfile">;
type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "UserProfile">;

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

export default function UserProfileScreen() {
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { userId } = route.params;

  const { profile, tab, setTab, isLoading, error } = useUserProfile(userId);
  const { isFollowing, toggleFollow } = useProfileContext();

  // Fetch real data from database
  const { artworks, loading: artworksLoading } = useUserArtworks(userId);
  const { moments, loading: momentsLoading } = useUserMoments(userId);

  const [headerHeight, setHeaderHeight] = React.useState(96);

  // Debug: Log fetched data
  React.useEffect(() => {
    console.log("UserProfile Data:", {
      userId,
      artworksCount: artworks.length,
      momentsCount: moments.length,
      artworksLoading,
      momentsLoading,
    });
  }, [userId, artworks.length, moments.length, artworksLoading, momentsLoading]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleFollow = () => {
    toggleFollow(userId);
  };

  const handleShare = async () => {
    await shareProfile(profile);
  };

  const handleSeeAllArtworks = () => {
    setTab("artworks");
  };

  const handleSeeAllMoments = () => {
    setTab("moments");
  };

  const handleSeeAllMoodboards = () => {
    setTab("moodboards");
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

  const handlePressMoodboard = (moodboard: ProfileMoodboard) => {
    navigation.navigate(
      "MoodboardDetail" as never,
      {
        id: moodboard.id,
        ownerId: userId,
        title: moodboard.title,
        cover: moodboard.coverImage ?? undefined,
        ownerName: moodboard.ownerName,
      } as never
    );
  };

  if (error) {
    return (
      <View className="flex-1 bg-white">
        <UserProfileHeader
          onPressBack={handleBack}
          onLayout={(e: any) => setHeaderHeight(e.nativeEvent.layout.height)}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-semibold text-slate-900 mb-2">
            Unable to load profile
          </Text>
          <Text className="text-sm text-slate-500 text-center">
            {error.message}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <UserProfileHeader
        onPressBack={handleBack}
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
            <UserProfileActionButtons
              isFollowing={isFollowing(userId)}
              onPressFollow={handleFollow}
              onPressShare={handleShare}
            />
            <ProfileTabBar tab={tab} onChange={setTab} />

            <View className="px-1 pb-4">
              {tab === "overview" && (
                <UserProfileOverviewTab
                  profile={profile}
                  artworks={artworks}
                  moments={moments}
                  onPressSeeAllArtworks={handleSeeAllArtworks}
                  onPressSeeAllMoments={handleSeeAllMoments}
                  onPressSeeAllMoodboards={handleSeeAllMoodboards}
                  onPressArtwork={handlePressArtwork}
                  onPressMoment={handlePressMoment}
                  onPressMoodboard={handlePressMoodboard}
                />
              )}
              {tab === "artworks" && (
                <UserProfileArtworksTab
                  artworks={artworks}
                  onPressArtwork={handlePressArtwork}
                />
              )}
              {tab === "moments" && (
                <UserProfileMomentsTab
                  moments={moments}
                  onPressMoment={handlePressMoment}
                />
              )}
              {tab === "moodboards" && (
                <ProfileMoodboardsTab
                  profile={profile}
                  onPressMoodboard={handlePressMoodboard}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

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
import type { ArtworkCardItem } from "../domains/user/components/profile/ArtworkCard";
import type { MomentCardItem } from "../domains/user/components/profile/MomentCard";
import { useUserProfile } from "../domains/user/hooks/useUserProfile";
import { useProfileContext } from "../domains/user/contexts/ProfileContext";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { shareProfile } from "../shared/utils/shareProfile";

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

  const [headerHeight, setHeaderHeight] = React.useState(96);

  // Mock data for artworks and moments - replace with real data from API
  const mockArtworks: ArtworkCardItem[] = [
    {
      id: "1",
      title: "Conscion in a conch",
      artist: profile.user.name,
      image: "https://picsum.photos/400/500?random=1",
      price: "$1,500",
    },
    {
      id: "2",
      title: "Cat man do",
      artist: profile.user.name,
      image: "https://picsum.photos/400/500?random=2",
      price: "$1,400",
    },
  ];

  const mockMoments: MomentCardItem[] = [
    {
      id: "1",
      author: {
        id: userId,
        name: profile.user.name,
        handle: profile.user.handle,
        avatar: profile.user.avatarUri || undefined,
        verified: false,
      },
      content: "I am on Instagram",
      media: {
        type: "image",
        uri: "https://picsum.photos/600/800?random=3",
        aspectRatio: 4 / 5,
      },
      likeCount: 1,
      commentCount: 0,
      isLiked: false,
    },
    {
      id: "2",
      author: {
        id: userId,
        name: profile.user.name,
        handle: profile.user.handle,
        avatar: profile.user.avatarUri || undefined,
        verified: false,
      },
      content: "My oddities...",
      media: {
        type: "video",
        uri: "https://picsum.photos/600/800?random=4",
        aspectRatio: 4 / 5,
      },
      likeCount: 2,
      commentCount: 0,
      isLiked: false,
    },
  ];

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

  const handlePressArtwork = (artworkId: string) => {
    console.log("Navigate to artwork:", artworkId);
    // TODO: Navigate to artwork detail
  };

  const handlePressMoment = (momentId: string) => {
    console.log("Navigate to moment:", momentId);
    // TODO: Navigate to moment detail
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
                  artworks={mockArtworks}
                  moments={mockMoments}
                  onPressSeeAllArtworks={handleSeeAllArtworks}
                  onPressSeeAllMoments={handleSeeAllMoments}
                  onPressArtwork={handlePressArtwork}
                  onPressMoment={handlePressMoment}
                />
              )}
              {tab === "artworks" && (
                <UserProfileArtworksTab
                  artworks={mockArtworks}
                  onPressArtwork={handlePressArtwork}
                />
              )}
              {tab === "moments" && (
                <UserProfileMomentsTab
                  moments={mockMoments}
                  onPressMoment={handlePressMoment}
                />
              )}
              {tab === "moodboards" && <ProfileMoodboardsTab profile={profile} />}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

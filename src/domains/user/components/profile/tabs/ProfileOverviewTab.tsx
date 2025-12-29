import React from "react";
import { View, Text, ScrollView } from "react-native";
import ProfileSection from "../ProfileSection";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileMoodboard, ProfileViewModel } from "../../../types";
import ArtworkCard, { ArtworkCardItem } from "../ArtworkCard";
import MomentCard, { MomentCardItem } from "../MomentCard";
import MoodboardCard from "../MoodboardCard";

type Props = {
  profile: ProfileViewModel;
  artworks?: ArtworkCardItem[];
  moments?: MomentCardItem[];
  onPressUpload?: () => void;
  onPressShare?: () => void;
  onPressSeeAllArtworks?: () => void;
  onPressSeeAllMoments?: () => void;
  onPressSeeAllMoodboards?: () => void;
  onPressArtwork?: (artworkId: string) => void;
  onPressMoment?: (momentId: string) => void;
  onPressMoodboard?: (moodboard: ProfileMoodboard) => void;
};

export default function ProfileOverviewTab({
  profile,
  artworks = [],
  moments = [],
  onPressUpload,
  onPressShare,
  onPressSeeAllArtworks,
  onPressSeeAllMoments,
  onPressSeeAllMoodboards,
  onPressArtwork,
  onPressMoment,
  onPressMoodboard,
}: Props) {
  const moodboards = profile.moodboards ?? [];

  return (
    <View className="pt-1">
      <ProfileSection
        title="Moodboards"
        actions={
          moodboards.length > 0
            ? [{ label: "See All", tone: "secondary", onPress: onPressSeeAllMoodboards }]
            : []
        }
      >
        {moodboards.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 12, paddingBottom: 12 }}
          >
            {moodboards.slice(0, 6).map((board) => (
              <MoodboardCard
                key={board.id}
                moodboard={board}
                variant="carousel"
                onPress={() => onPressMoodboard?.(board)}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-8 items-center">
            <Text className="text-sm text-center text-slate-500">
              Save artworks into moodboards to show them here.
            </Text>
          </View>
        )}
      </ProfileSection>

      {/* Featured Artworks Section */}
      <ProfileSection
        title="Featured Artworks"
        actions={
          artworks.length > 0
            ? [
                { label: "See All", tone: "secondary", onPress: onPressSeeAllArtworks },
                { label: "+ Upload", tone: "primary", onPress: onPressUpload },
              ]
            : [{ label: "+ Upload", tone: "primary", onPress: onPressUpload }]
        }
      >
        {artworks.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
          >
            {artworks.slice(0, 5).map((artwork) => (
              <View key={artwork.id} style={{ width: 200 }}>
                <ArtworkCard
                  item={artwork}
                  onPress={() => onPressArtwork?.(artwork.id)}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-8 items-center">
            <Text className="text-sm text-center text-slate-500">
              No artworks yet
            </Text>
          </View>
        )}
      </ProfileSection>

      {/* Moments Section */}
      <ProfileSection
        title={PROFILE_STRINGS.momentsTitle}
        actions={
          moments.length > 0
            ? [
                { label: "See All", tone: "secondary", onPress: onPressSeeAllMoments },
                { label: "+ Share", tone: "primary", onPress: onPressShare },
              ]
            : [{ label: "+ Share", tone: "primary", onPress: onPressShare }]
        }
      >
        {moments.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
          >
            {moments.slice(0, 6).map((moment) => (
              <MomentCard
                key={moment.id}
                item={moment}
                variant="compact"
                onPress={() => onPressMoment?.(moment.id)}
                onPressAuthor={() => {}}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="rounded-2xl border border-slate-200 bg-[#F8FAFC] px-4 py-8 items-center">
            <Text className="text-sm text-center text-slate-500">
              {PROFILE_STRINGS.momentsEmpty}
            </Text>
          </View>
        )}
      </ProfileSection>
    </View>
  );
}

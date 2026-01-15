import React from "react";
import { View } from "react-native";
import ProfileEmptyState from "../ProfileEmptyState";
import { PROFILE_STRINGS } from "../../../constants/profile";
import { ProfileViewModel } from "../../../types";
import ArtworkCard from "../ArtworkCard";
import { useOwnerArtworks } from "../../../hooks/useOwnerArtworks";

type Props = {
  profile: ProfileViewModel;
  onPressArtwork?: (artworkId: string) => void;
};

export default function ProfileArtworksTab({ profile, onPressArtwork }: Props) {
  const { artworks, loading } = useOwnerArtworks();

  if (loading) {
    return (
      <View className="pt-3">
        <View className="flex-row flex-wrap px-1">
          {[1, 2, 3, 4].map((i) => (
            <View key={i} className="w-1/2 p-1">
              <View className="aspect-[4/5] rounded-xl bg-slate-200 animate-pulse" />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (artworks.length === 0) {
    return (
      <View className="pt-3">
        <ProfileEmptyState message={PROFILE_STRINGS.artworksEmpty} />
      </View>
    );
  }

  return (
    <View className="pt-3">
      <View className="flex-row flex-wrap px-1">
        {artworks.map((artwork) => (
          <View key={artwork.id} className="w-1/2 p-1">
            <ArtworkCard
              item={artwork}
              onPress={() => onPressArtwork?.(artwork.id)}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

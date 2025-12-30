import React from "react";
import { View, Text } from "react-native";
import ArtworkCard, { ArtworkCardItem } from "../ArtworkCard";

type Props = {
  artworks?: ArtworkCardItem[];
  onPressArtwork?: (artworkId: string) => void;
};

export default function UserProfileArtworksTab({
  artworks = [],
  onPressArtwork,
}: Props) {
  if (artworks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-sm text-slate-500">No artworks yet</Text>
      </View>
    );
  }

  return (
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
  );
}

import React, { useMemo } from "react";
import { FlatList, ListRenderItemInfo, View, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Artwork } from "../../types";
import ArtworkCard from "../cards/ArtworkCard";

type Props = {
  data: Artwork[];
  onCardPress?: (item: Artwork) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

// Define a type for the items in our list, which can be a real artwork or a phantom spacer
type ListItem = Artwork | { id: string; empty: true };


export default function DiscoverArtworksTab({ data, onCardPress, onScroll }: Props) {
  const navigation = useNavigation();

  // Add a phantom item if the data length is odd
  const formattedData: ListItem[] = useMemo(() => {
    if (data.length % 2 === 1) {
      return [...data, { id: "phantom", empty: true }];
    }
    return data;
  }, [data]);

  const renderItem = ({ item }: ListRenderItemInfo<ListItem>) => {
    // If the item is a phantom spacer, render an empty view
    if ('empty' in item && item.empty) {
      return <View className="flex-1" />;
    }

    // Otherwise, render the real ArtworkCard
    const artworkItem = item as Artwork;
    return (
      <ArtworkCard
        item={artworkItem}
        onPress={() =>
          (navigation.navigate as any)("ArtworkDetail", { id: artworkItem.id })
        }
      />
    );
  };

  return (
    <FlatList
      data={formattedData}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
      }}
      columnWrapperStyle={{ columnGap: 12, marginBottom: 12 }} // Added marginBottom to wrapper for row gap
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

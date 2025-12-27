import React, { useMemo } from "react";
import { FlatList, ListRenderItemInfo, View, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Artwork } from "../../types";
import ArtworkCard from "../cards/ArtworkCard";

type Props = {
  data: Artwork[];
  onCardPress?: (item: Artwork) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
};

// Define a type for the items in our list, which can be a real artwork or a phantom spacer
type ListItem = Artwork | { id: string; empty: true };


export default function DiscoverArtworksTab({ data, onCardPress, onScroll, onEndReached, isFetchingNextPage }: Props) {
  const navigation = useNavigation();

  const formattedData: ListItem[] = useMemo(() => {
    if (data.length % 2 === 1) {
      return [...data, { id: "phantom", empty: true }];
    }
    return data;
  }, [data]);

  const renderItem = ({ item }: ListRenderItemInfo<ListItem>) => {
    if ('empty' in item && item.empty) {
      return <View className="flex-1" />;
    }

    const artworkItem = item as Artwork;
    return (
      <View className="flex-1">
        <ArtworkCard
          item={artworkItem}
          onPress={() => {
            if (onCardPress) {
              onCardPress(artworkItem);
            } else {
              console.log("Navigating to ArtworkDetail with ID:", artworkItem.id);
              (navigation.navigate as any)("ArtworkDetail", { id: artworkItem.id });
            }
          }}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={formattedData}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="large" color="#94A3B8" style={{ marginVertical: 20 }} /> : null}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
      }}
      columnWrapperStyle={{ columnGap: 12, marginBottom: 12 }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

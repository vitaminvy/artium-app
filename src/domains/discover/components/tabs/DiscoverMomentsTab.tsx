import React from "react";
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Artwork } from "../../types";
import MomentCard from "../cards/MomentCard";

type Props = {
  data: Artwork[];
  onCardPress?: (item: Artwork) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
};

export default function DiscoverMomentsTab({ data, onCardPress, onScroll, onEndReached, isFetchingNextPage }: Props) {
  const navigation = useNavigation();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MomentCard
          item={item}
          onPress={() =>
            onCardPress
              ? onCardPress(item)
              : (navigation.navigate as any)("ArtworkDetail", { id: item.id })
          }
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="large" color="#94A3B8" style={{ marginVertical: 20 }} /> : null}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
        rowGap: 16,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

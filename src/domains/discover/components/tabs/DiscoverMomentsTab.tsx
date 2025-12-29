import React from "react";
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { DiscoverMoment } from "../../types";
import MasonryFlatList from "../../../../shared/components/MasonryFlatList";
import MasonryMomentCard from "../../../user/components/profile/MasonryMomentCard";

type Props = {
  data: DiscoverMoment[];
  onCardPress?: (item: DiscoverMoment) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
};

export default function DiscoverMomentsTab({ data, onCardPress, onScroll, onEndReached, isFetchingNextPage }: Props) {
  return (
    <MasonryFlatList
      data={data}
      numColumns={2}
      columnGap={8}
      keyExtractor={(item) => item.id}
      renderItem={(item) => (
        <MasonryMomentCard
          item={item.card}
          onPress={() => onCardPress?.(item)}
          onPressAuthor={() => {}}
        />
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator size="large" color="#94A3B8" style={{ marginVertical: 20 }} />
        ) : null
      }
      contentContainerStyle={{
        paddingTop: 12,
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

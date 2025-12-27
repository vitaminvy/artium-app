import React from "react";
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, View, useWindowDimensions } from "react-native";
import { DiscoverMoment } from "../../types";
import MomentCard from "../../../user/components/profile/MomentCard";

type Props = {
  data: DiscoverMoment[];
  onCardPress?: (item: DiscoverMoment) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
};

export default function DiscoverMomentsTab({ data, onCardPress, onScroll, onEndReached, isFetchingNextPage }: Props) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 16;
  const itemGap = 12;
  const cardWidth = (width - horizontalPadding * 2 - itemGap) / 2;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: itemGap, paddingHorizontal: horizontalPadding }}
      renderItem={({ item }) => (
        <View style={{ width: cardWidth, marginBottom: 16 }}>
          <MomentCard
            item={item.card}
            onPress={() => onCardPress?.(item)}
            variant="compact"
            style={{ width: cardWidth }}
          />
        </View>
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="large" color="#94A3B8" style={{ marginVertical: 20 }} /> : null}
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

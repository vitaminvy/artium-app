import React from "react";
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { EventItem } from "../../types";
import EventCard from "../cards/EventCard";

type Props = {
  data: EventItem[];
  onCardPress?: (item: EventItem) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
};

export default function DiscoverEventsTab({ data, onCardPress, onScroll, onEndReached, isFetchingNextPage }: Props) {
  const renderItem = ({ item }: ListRenderItemInfo<EventItem>) => (
    <EventCard
      item={item}
      onPress={onCardPress ? () => onCardPress(item) : undefined}
    />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="large" color="#94A3B8" style={{ marginVertical: 20 }} /> : null}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
        rowGap: 12,
      }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

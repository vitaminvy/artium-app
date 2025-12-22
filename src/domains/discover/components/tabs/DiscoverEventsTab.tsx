import React from "react";
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { EventItem } from "../../types";
import EventCard from "../cards/EventCard";

type Props = {
  data: EventItem[];
  onCardPress?: (item: EventItem) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export default function DiscoverEventsTab({ data, onCardPress, onScroll }: Props) {
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

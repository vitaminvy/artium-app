import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { EventItem } from "../../types";
import EventCard from "../cards/EventCard";

type Props = {
  data: EventItem[];
};

export default function DiscoverEventsTab({ data }: Props) {
  const renderItem = ({ item }: ListRenderItemInfo<EventItem>) => (
    <EventCard item={item} />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 24,
        rowGap: 12,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

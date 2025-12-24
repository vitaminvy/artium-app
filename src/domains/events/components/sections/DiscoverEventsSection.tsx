import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption } from "../../types";
import EventCard from "../../../discover/components/cards/EventCard";
import EmptyStateCard from "../ui/EmptyStateCard";
import FilterPill from "../ui/FilterPill";
import SearchInput from "../ui/SearchInput";

type Props = {
  events: EventItem[];
  filters: EventFilterOption[];
  query: string;
  onChangeQuery: (value: string) => void;
};

export default function DiscoverEventsSection({
  events,
  filters,
  query,
  onChangeQuery,
}: Props) {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <Text className="text-lg font-semibold text-slate-900">
        Discover events
      </Text>

      <View className="mt-4">
        <SearchInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="Search by title, location, artist or gallery"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingVertical: 12 }}
      >
        {filters.map((filter) => (
          <FilterPill key={filter.id} label={filter.label} />
        ))}
      </ScrollView>

      <View className="mt-2">
        {events.length ? (
          <View className="gap-4">
            {events.map((event) => (
              <EventCard key={event.id} item={event} />
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="No discoverable events"
            description="Try adjusting your filters or search terms"
          />
        )}
      </View>
    </View>
  );
}

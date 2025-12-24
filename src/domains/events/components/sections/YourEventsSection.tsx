import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption } from "../../types";
import EmptyStateCard from "../ui/EmptyStateCard";
import FilterPill from "../ui/FilterPill";
import SearchInput from "../ui/SearchInput";

type Props = {
  events: EventItem[];
  filters: EventFilterOption[];
  query: string;
  onChangeQuery: (value: string) => void;
};

export default function YourEventsSection({
  events,
  filters,
  query,
  onChangeQuery,
}: Props) {
  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <Text className="text-lg font-semibold text-slate-900">Your events</Text>

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
          <View className="gap-3">
            {events.map((event) => (
              <View
                key={event.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <Text className="text-[14px] font-semibold text-slate-900">
                  {event.title}
                </Text>
                <Text className="mt-1 text-[12px] text-slate-500">
                  {event.location}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="No events available yet"
            description="There is no event available at the moment"
          />
        )}
      </View>
    </View>
  );
}

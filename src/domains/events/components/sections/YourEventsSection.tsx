import React from "react";
import { LayoutChangeEvent, ScrollView, Text, View } from "react-native";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, EventSortOption } from "../../types";
import EmptyStateCard from "../ui/EmptyStateCard";
import SearchInput from "../ui/SearchInput";
import SelectSheet from "../ui/SelectSheet";
import EventCard from "../../../discover/components/cards/EventCard";

type Props = {
  events: EventItem[];
  statusOptions: EventFilterOption[];
  typeOptions: EventFilterOption[];
  dateOptions: EventSortOption[];
  statusValue: EventFilterOption;
  typeValue: EventFilterOption;
  dateValue: EventSortOption;
  onChangeStatus: (value: EventFilterOption) => void;
  onChangeType: (value: EventFilterOption) => void;
  onChangeDate: (value: EventSortOption) => void;
  query: string;
  onChangeQuery: (value: string) => void;
  getRsvpStatus: (id: string) => "none" | "going" | "maybe" | "notGoing";
  onChangeRsvp: (id: string, status: "none" | "going" | "maybe" | "notGoing") => void;
  onLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
};

export default function YourEventsSection({
  events,
  statusOptions,
  typeOptions,
  dateOptions,
  statusValue,
  typeValue,
  dateValue,
  onChangeStatus,
  onChangeType,
  onChangeDate,
  query,
  onChangeQuery,
  getRsvpStatus,
  onChangeRsvp,
  onLayout,
}: Props) {
  const handleLayout = (e: LayoutChangeEvent) => {
    onLayout?.(e.nativeEvent.layout);
  };

  return (
    <View
      className="rounded-3xl border border-slate-200 bg-white p-5"
      onLayout={handleLayout}
    >
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
        <SelectSheet
          variant="pill"
          value={statusValue}
          options={statusOptions}
          onChange={onChangeStatus}
        />
        <SelectSheet
          variant="pill"
          value={typeValue}
          options={typeOptions}
          onChange={onChangeType}
          placeholder="Event Type"
        />
        <SelectSheet
          variant="pill"
          value={dateValue}
          options={dateOptions}
          onChange={onChangeDate}
        />
      </ScrollView>

      <View className="mt-2">
        {events.length ? (
          <View className="gap-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                item={event}
                rsvpStatus={getRsvpStatus(event.id)}
                onRsvpChange={(status) => onChangeRsvp(event.id, status)}
              />
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

import React, { useState } from "react";
import { LayoutChangeEvent, ScrollView, Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

const INITIAL_COUNT = 4;
const INCREMENT = 4;

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const handleLayout = (e: LayoutChangeEvent) => {
    onLayout?.(e.nativeEvent.layout);
  };

  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + INCREMENT);
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
        {visibleEvents.length ? (
          <View className="gap-4">
            {visibleEvents.map((event) => (
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

      {events.length > 0 && (
        <View className="mt-5 items-center gap-3">
          <Text className="text-[12px] text-slate-500">
            Showing {visibleCount} of {events.length} events
          </Text>

          {hasMore && (
            <Pressable
              onPress={handleShowMore}
              className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3"
            >
              <Text className="text-[14px] font-semibold text-white">
                Show More
              </Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

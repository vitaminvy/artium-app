import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventItem } from "../../../discover/types";
import type { EventSortOption } from "../../types";
import SelectSheet from "../ui/SelectSheet";
import EmptyStateCard from "../ui/EmptyStateCard";
import EventCard from "../../../discover/components/cards/EventCard";

type Props = {
  events: EventItem[];
  sortOptions: EventSortOption[];
  sortValue: EventSortOption;
  onChangeSort: (option: EventSortOption) => void;
  onCreateEvent?: () => void;
  getRsvpStatus: (id: string) => "none" | "going" | "maybe" | "notGoing";
  onChangeRsvp: (id: string, status: "none" | "going" | "maybe" | "notGoing") => void;
  onPressEvent?: (event: EventItem) => void;
  isLoading?: boolean;
};

const INITIAL_COUNT = 4;
const INCREMENT = 4;

export default function EventsHostingSection({
  events,
  sortOptions,
  sortValue,
  onChangeSort,
  onCreateEvent,
  getRsvpStatus,
  onChangeRsvp,
  onPressEvent,
  isLoading = false,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const hasEvents = events.length > 0;
  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + INCREMENT);
  };

  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-slate-900">
          Events You're Hosting
        </Text>

        {hasEvents && onCreateEvent && (
          <Pressable
            onPress={onCreateEvent}
            className="flex-row items-center gap-1.5 rounded-full border border-[#0B73FF] px-3 py-1.5"
          >
            <View className="h-5 w-5 rounded-full bg-[#0B73FF] items-center justify-center">
              <Ionicons name="add" size={12} color="#FFFFFF" />
            </View>
            <Text className="text-[12px] font-semibold text-[#0B73FF]">
              Create event
            </Text>
          </Pressable>
        )}
      </View>

      <View className="mt-4">
        <SelectSheet
          value={sortValue}
          options={sortOptions}
          onChange={onChangeSort}
        />
      </View>

      <View className="mt-4">
        {isLoading ? (
          <View className="py-4 items-center">
            <Text className="text-[12px] text-slate-500">Loading your events...</Text>
          </View>
        ) : hasEvents ? (
          <View className="gap-4">
            {visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                item={event}
                rsvpStatus={getRsvpStatus(event.id)}
                onRsvpChange={(status) => onChangeRsvp(event.id, status)}
                onPress={() => onPressEvent?.(event)}
              />
            ))}
          </View>
        ) : (
          <EmptyStateCard
            title="No events yet"
            description="Create and manage upcoming exhibitions, openings, or art-related events"
            actionLabel="Create event"
            onAction={onCreateEvent}
          />
        )}
      </View>

      {hasEvents && (
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

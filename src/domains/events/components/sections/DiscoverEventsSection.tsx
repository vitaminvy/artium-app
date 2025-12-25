import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, EventSortOption } from "../../types";
import EventCard from "../../../discover/components/cards/EventCard";
import EmptyStateCard from "../ui/EmptyStateCard";
import SearchInput from "../ui/SearchInput";
import SelectSheet from "../ui/SelectSheet";

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
  onPressEvent?: (event: EventItem) => void;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onEndReached?: () => void;
};

const PAGE_SIZE = 8;

function DiscoverEventsSection({
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
  onPressEvent,
  isLoading = false,
  isFetchingNextPage = false,
  onEndReached,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const total = events.length;

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, statusValue.id, typeValue.id, dateValue.id]);

  // Calculate visible events
  const visibleEvents = useMemo(() => {
    return events.slice(0, visibleCount);
  }, [events, visibleCount]);

  // Check if there are more events to load
  const hasMore = visibleCount < total;

  // Load more events
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, total));
  };

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
        {isLoading ? (
          <View className="py-6 items-center">
            <Text className="text-[12px] text-slate-500">Loading events...</Text>
          </View>
        ) : events.length ? (
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
            title="No discoverable events"
            description="Try adjusting your filters or search terms"
          />
        )}
      </View>

      {events.length ? (
        <View className="mt-5 items-center gap-3">
          <Text className="text-[12px] text-slate-500">
            Showing {visibleCount} of {total} events
          </Text>

          {(hasMore || isFetchingNextPage) && (
            <Pressable
              onPress={() => {
                handleLoadMore();
                onEndReached?.();
              }}
              className="flex-row items-center gap-2 rounded-full bg-slate-900 px-6 py-3"
              disabled={isFetchingNextPage}
            >
              <Text className="text-[14px] font-semibold text-white">
                {isFetchingNextPage ? "Loading..." : "Show More"}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

export default React.memo(DiscoverEventsSection);

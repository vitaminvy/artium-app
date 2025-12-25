import React from "react";
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
  const hasEvents = events.length > 0;

  return (
    <View className="rounded-3xl border border-slate-200 bg-white p-5">
      <Text className="text-lg font-semibold text-slate-900">
        Events You're Hosting
      </Text>

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
          <View className="gap-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                item={event}
                rsvpStatus={getRsvpStatus(event.id)}
                onRsvpChange={(status) => onChangeRsvp(event.id, status)}
                onPress={() => onPressEvent?.(event)}
              />
            ))}
            {onCreateEvent ? (
              <Pressable
                onPress={onCreateEvent}
                className="flex-row items-center justify-center gap-2 rounded-full border border-[#0B73FF] px-5 py-2.5"
              >
                <View className="h-6 w-6 rounded-full bg-[#0B73FF] items-center justify-center">
                  <Ionicons name="add" size={14} color="#FFFFFF" />
                </View>
                <Text className="text-[13px] font-semibold text-[#0B73FF]">
                  Create event
                </Text>
              </Pressable>
            ) : null}
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
    </View>
  );
}

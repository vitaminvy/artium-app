import React from "react";
import { Text, View } from "react-native";
import type { EventItem } from "../../../discover/types";
import type { EventSortOption } from "../../types";
import SelectSheet from "../ui/SelectSheet";
import EmptyStateCard from "../ui/EmptyStateCard";

type Props = {
  events: EventItem[];
  sortOptions: EventSortOption[];
  sortValue: EventSortOption;
  onChangeSort: (option: EventSortOption) => void;
  onCreateEvent?: () => void;
};

export default function EventsHostingSection({
  events,
  sortOptions,
  sortValue,
  onChangeSort,
  onCreateEvent,
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
        {hasEvents ? (
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

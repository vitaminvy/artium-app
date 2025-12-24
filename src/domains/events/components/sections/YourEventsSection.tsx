import React from "react";
import { ScrollView, Text, View } from "react-native";
import type { EventItem } from "../../../discover/types";
import type { EventFilterOption, EventSortOption } from "../../types";
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

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  onPageChange?: () => void;
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
  onPageChange,
}: Props) {
  const [page, setPage] = useState(1);
  const total = events.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const didMount = useRef(false);

  useEffect(() => {
    setPage(1);
  }, [query, statusValue.id, typeValue.id, dateValue.id]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (didMount.current) {
      onPageChange?.();
    } else {
      didMount.current = true;
    }
  }, [page, onPageChange]);

  const pageEvents = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return events.slice(start, start + PAGE_SIZE);
  }, [events, page]);

  const pageRange = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return [1, 2, totalPages - 1, totalPages];
  }, [totalPages]);

  const startItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, total);

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
        {events.length ? (
          <View className="gap-4">
            {pageEvents.map((event) => (
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

      {events.length ? (
        <View className="mt-5 items-center gap-3">
          <Text className="text-[12px] text-slate-500">
            {startItem}-{endItem} of {total}
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`h-9 w-9 items-center justify-center rounded-full border ${
                page === 1 ? "border-slate-100" : "border-slate-200"
              }`}
            >
              <Ionicons
                name="arrow-back"
                size={16}
                color={page === 1 ? "#CBD5F5" : "#0F172A"}
              />
            </Pressable>

            <View className="flex-row items-center gap-2">
              {pageRange.map((pageNumber, index) => {
                if (
                  totalPages > 5 &&
                  index > 0 &&
                  pageNumber - pageRange[index - 1] > 1
                ) {
                  return (
                    <Text
                      key={`dots-${pageNumber}`}
                      className="text-[12px] text-slate-400"
                    >
                      ...
                    </Text>
                  );
                }
                const isActive = pageNumber === page;
                return (
                  <Pressable
                    key={pageNumber}
                    onPress={() => setPage(pageNumber)}
                    className={`h-9 w-9 items-center justify-center rounded-full ${
                      isActive ? "bg-slate-900" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`text-[13px] font-semibold ${
                        isActive ? "text-white" : "text-slate-600"
                      }`}
                    >
                      {pageNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() =>
                setPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={page === totalPages}
              className={`h-9 w-9 items-center justify-center rounded-full border ${
                page === totalPages ? "border-slate-100" : "border-slate-200"
              }`}
            >
              <Ionicons
                name="arrow-forward"
                size={16}
                color={page === totalPages ? "#CBD5F5" : "#0F172A"}
              />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default React.memo(DiscoverEventsSection);

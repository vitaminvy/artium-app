import { useMemo, useState } from "react";

import type { EventItem } from "../../discover/types";
import type { EventFilterOption, EventSortOption } from "../types";
import {
  eventsMockData,
  HOSTING_SORT_OPTIONS,
  YOUR_EVENT_FILTERS,
  DISCOVER_EVENT_FILTERS,
} from "../mockData";

const filterByQuery = (events: EventItem[], query: string) => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return events;
  return events.filter((event) => {
    return (
      event.title.toLowerCase().includes(trimmed) ||
      event.location.toLowerCase().includes(trimmed)
    );
  });
};

type UseEventsResult = {
  hostingEvents: EventItem[];
  yourEvents: EventItem[];
  discoverEvents: EventItem[];
  hostingSortOptions: EventSortOption[];
  hostingSort: EventSortOption;
  setHostingSort: (option: EventSortOption) => void;
  yourFilters: EventFilterOption[];
  discoverFilters: EventFilterOption[];
  yourQuery: string;
  setYourQuery: (value: string) => void;
  discoverQuery: string;
  setDiscoverQuery: (value: string) => void;
};

export function useEvents(): UseEventsResult {
  const [hostingSort, setHostingSort] = useState<EventSortOption>(
    HOSTING_SORT_OPTIONS[0]
  );
  const [yourQuery, setYourQuery] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");

  const hostingEvents = useMemo(
    () => eventsMockData.hostingEvents,
    []
  );

  const yourEvents = useMemo(
    () => filterByQuery(eventsMockData.yourEvents, yourQuery),
    [yourQuery]
  );

  const discoverEvents = useMemo(
    () => filterByQuery(eventsMockData.discoverEvents, discoverQuery),
    [discoverQuery]
  );

  return {
    hostingEvents,
    yourEvents,
    discoverEvents,
    hostingSortOptions: HOSTING_SORT_OPTIONS,
    hostingSort,
    setHostingSort,
    yourFilters: YOUR_EVENT_FILTERS,
    discoverFilters: DISCOVER_EVENT_FILTERS,
    yourQuery,
    setYourQuery,
    discoverQuery,
    setDiscoverQuery,
  };
}

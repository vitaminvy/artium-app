import { useCallback, useMemo, useState } from "react";

import type { EventItem } from "../../discover/types";
import type { EventFilterOption, EventSortOption } from "../types";

import {
  eventsMockData,
  HOSTING_SORT_OPTIONS,
  EVENT_STATUS_OPTIONS,
  EVENT_TYPE_OPTIONS,
} from "../mockData";

type RsvpStatus = "none" | "going" | "maybe" | "notGoing";

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

const resolveStatus = (event: EventItem) => {
  const now = new Date();
  const eventDate = new Date(event.datetime ?? event.startDate ?? 0);
  if (eventDate < now) return "past";
  if (event.status === "ongoing") return "ongoing";
  return "upcoming";
};

const sortEvents = (events: EventItem[], sortBy: EventSortOption) => {
  const sorted = [...events];
  if (sortBy.id === "oldest") {
    sorted.sort(
      (a, b) =>
        new Date(a.datetime ?? a.startDate ?? 0).getTime() -
        new Date(b.datetime ?? b.startDate ?? 0).getTime()
    );
    return sorted;
  }
  if (sortBy.id === "attendees") {
    sorted.sort((a, b) => (b.attendees ?? 0) - (a.attendees ?? 0));
    return sorted;
  }
  sorted.sort(
    (a, b) =>
      new Date(b.datetime ?? b.startDate ?? 0).getTime() -
      new Date(a.datetime ?? a.startDate ?? 0).getTime()
  );
  return sorted;
};

const applyFilters = (
  events: EventItem[],
  query: string,
  status: EventFilterOption,
  type: EventFilterOption,
  sortBy: EventSortOption
) => {
  let result = filterByQuery(events, query);
  if (status.id !== "all") {
    result = result.filter((event) => resolveStatus(event) === status.id);
  }
  if (type.id !== "all") {
    result = result.filter(
      (event) => (event.eventType ?? event.category) === type.id
    );
  }
  return sortEvents(result, sortBy);
};

type UseEventsResult = {
  hostingEvents: EventItem[];
  yourEvents: EventItem[];
  discoverEvents: EventItem[];
  addHostedEvent: (event: EventItem) => void;
  getRsvpStatus: (id: string) => RsvpStatus;
  setRsvpStatus: (id: string, status: RsvpStatus) => void;
  hostingSortOptions: EventSortOption[];
  hostingSort: EventSortOption;
  setHostingSort: (option: EventSortOption) => void;
  statusOptions: EventFilterOption[];
  typeOptions: EventFilterOption[];
  dateOptions: EventSortOption[];
  yourStatus: EventFilterOption;
  setYourStatus: (option: EventFilterOption) => void;
  yourType: EventFilterOption;
  setYourType: (option: EventFilterOption) => void;
  yourDateSort: EventSortOption;
  setYourDateSort: (option: EventSortOption) => void;
  discoverStatus: EventFilterOption;
  setDiscoverStatus: (option: EventFilterOption) => void;
  discoverType: EventFilterOption;
  setDiscoverType: (option: EventFilterOption) => void;
  discoverDateSort: EventSortOption;
  setDiscoverDateSort: (option: EventSortOption) => void;
  yourQuery: string;
  setYourQuery: (value: string) => void;
  discoverQuery: string;
  setDiscoverQuery: (value: string) => void;
};

export function useEvents(): UseEventsResult {
  const [hostingSort, setHostingSort] = useState<EventSortOption>(
    HOSTING_SORT_OPTIONS[0]
  );
  const [hostingItems, setHostingItems] = useState<EventItem[]>(
    eventsMockData.hostingEvents
  );
  const [hostingRsvpMap, setHostingRsvpMap] = useState<Record<string, RsvpStatus>>(
    {}
  );
  const [yourStatus, setYourStatus] = useState<EventFilterOption>(
    EVENT_STATUS_OPTIONS[0]
  );
  const [yourType, setYourType] = useState<EventFilterOption>(
    EVENT_TYPE_OPTIONS[0]
  );
  const [yourDateSort, setYourDateSort] = useState<EventSortOption>(
    HOSTING_SORT_OPTIONS[0]
  );
  const [rsvpMap, setRsvpMap] = useState<Record<string, RsvpStatus>>({});
  const [discoverItems, setDiscoverItems] = useState<EventItem[]>(
    eventsMockData.discoverEvents
  );
  const [discoverStatus, setDiscoverStatus] = useState<EventFilterOption>(
    EVENT_STATUS_OPTIONS[0]
  );
  const [discoverType, setDiscoverType] = useState<EventFilterOption>(
    EVENT_TYPE_OPTIONS[0]
  );
  const [discoverDateSort, setDiscoverDateSort] = useState<EventSortOption>(
    HOSTING_SORT_OPTIONS[0]
  );
  const [yourQuery, setYourQuery] = useState("");
  const [discoverQuery, setDiscoverQuery] = useState("");

  const hostingEvents = useMemo(
    () => sortEvents(hostingItems, hostingSort),
    [hostingItems, hostingSort]
  );

  const mergedEvents = useMemo(() => {
    const map = new Map<string, EventItem>();
    hostingItems.forEach((event) => map.set(event.id, event));
    discoverItems.forEach((event) => map.set(event.id, event));
    return Array.from(map.values());
  }, [hostingItems, discoverItems]);

  const discoverEvents = useMemo(
    () =>
      applyFilters(
        mergedEvents,
        discoverQuery,
        discoverStatus,
        discoverType,
        discoverDateSort
      ),
    [mergedEvents, discoverQuery, discoverStatus, discoverType, discoverDateSort]
  );

  const yourEvents = useMemo(() => {
    const selected = mergedEvents.filter((event) => {
      const status = (rsvpMap[event.id] ?? hostingRsvpMap[event.id]) ?? "none";
      return status !== "none";
    });
    return applyFilters(
      selected,
      yourQuery,
      yourStatus,
      yourType,
      yourDateSort
    );
  }, [mergedEvents, rsvpMap, hostingRsvpMap, yourQuery, yourStatus, yourType, yourDateSort]);

  const getRsvpStatus = useCallback(
    (id: string): RsvpStatus =>
      (rsvpMap[id] ?? hostingRsvpMap[id]) ?? "none",
    [rsvpMap, hostingRsvpMap]
  );

  const setRsvpStatus = useCallback((id: string, status: RsvpStatus) => {
    setRsvpMap((prev) => ({ ...prev, [id]: status }));
    setHostingRsvpMap((prev) => ({ ...prev, [id]: status }));
  }, []);

  return {
    hostingEvents,
    yourEvents,
    discoverEvents,
    addHostedEvent: (event: EventItem) => {
      setHostingItems((prev) => [event, ...prev]);
      setDiscoverItems((prev) => [event, ...prev]);
    },
    getRsvpStatus,
    setRsvpStatus,
    hostingSortOptions: HOSTING_SORT_OPTIONS,
    hostingSort,
    setHostingSort,
    statusOptions: EVENT_STATUS_OPTIONS,
    typeOptions: EVENT_TYPE_OPTIONS,
    dateOptions: HOSTING_SORT_OPTIONS,
    yourStatus,
    setYourStatus,
    yourType,
    setYourType,
    yourDateSort,
    setYourDateSort,
    discoverStatus,
    setDiscoverStatus,
    discoverType,
    setDiscoverType,
    discoverDateSort,
    setDiscoverDateSort,
    yourQuery,
    setYourQuery,
    discoverQuery,
    setDiscoverQuery,
  };
}

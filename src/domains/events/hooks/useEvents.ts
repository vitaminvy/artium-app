import { useCallback, useMemo, useState, useEffect } from "react";

import type { EventItem } from "../../discover/types";
import type { EventFilterOption, EventSortOption } from "../types";
import { HOSTING_SORT_OPTIONS, EVENT_STATUS_OPTIONS, EVENT_TYPE_OPTIONS } from "../mockData";
import { getEvents, fetchUserRsvps, toggleEventRsvp, fetchEventsByIds } from "../../discover/services/eventService";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

type RsvpStatus = "none" | "going" | "maybe" | "notGoing";

const filterByQuery = (events: EventItem[], query: string) => {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return events;
  return events.filter((event) => {
    return (
      (event.title ?? "").toLowerCase().includes(trimmed) ||
      (event.location ?? "").toLowerCase().includes(trimmed)
    );
  });
};

const resolveStatus = (event: EventItem) => {
  const now = new Date();
  const start = new Date(event.datetime ?? event.startDate ?? 0);
  const end = event.endDatetime ? new Date(event.endDatetime) : null;

  if (end) {
    if (now >= start && now <= end) return "ongoing";
    if (now < start) return "upcoming";
    return "past";
  }
  if (now < start) return "upcoming";
  return "past";
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
  isInitialLoading: boolean;
  isHostingLoading: boolean;
  isMoreEventsLoading: boolean;
  hasMoreEvents: boolean;
  loadMoreEvents: () => void;
  error: Error | null;
  addHostedEvent: (event: EventItem) => void;
  setHostingEvents: (events: EventItem[]) => void;
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
  const { currentUser } = useAuth();
  const [hostingSort, setHostingSort] = useState<EventSortOption>(
    HOSTING_SORT_OPTIONS[0]
  );
  const [hostingItems, setHostingItems] = useState<EventItem[]>([]);
  
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
  // extra events fetched specifically because the user RSVP'd to them but they weren't in discoverItems
  const [rsvpEventItems, setRsvpEventItems] = useState<EventItem[]>([]);

  const [discoverItems, setDiscoverItems] = useState<EventItem[]>([]);
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
  const [isMoreEventsLoading, setIsMoreEventsLoading] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [lastEventDoc, setLastEventDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [typeOptionsState, setTypeOptionsState] = useState<EventFilterOption[]>(EVENT_TYPE_OPTIONS);
  const [isHostingLoading, setIsHostingLoading] = useState(false);

  const recomputeTypes = useCallback((events: EventItem[]) => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.eventType) set.add(e.eventType);
      if (e.category) {
        e.category.split(",").map((s) => s.trim()).filter(Boolean).forEach((c) => set.add(c));
      }
      if (Array.isArray((e as any).tags)) {
        (e as any).tags.forEach((t: string) => set.add(t));
      }
    });
    const options: EventFilterOption[] = [
      { id: "all", label: "All types" },
      ...Array.from(set).map((label) => ({ id: label, label })),
    ];
    setTypeOptionsState(options);
  }, []);

  const fetchEventsPage = useCallback(
    async (cursor: QueryDocumentSnapshot<DocumentData> | null = null) => {
      try {
        const { events, lastVisible } = await getEvents(12, cursor);
        setLastEventDoc(lastVisible);
        setHasMoreEvents(events.length === 12);
        return events;
      } catch (e: any) {
        setError(e instanceof Error ? e : new Error("Failed to load events"));
        return [];
      }
    },
    []
  );

  const loadInitial = useCallback(async () => {
    setIsInitialLoading(true);
    // Discover
    const events = await fetchEventsPage(null);
    setDiscoverItems(events);
    recomputeTypes(events);
    setHostingItems((prev) => prev);
    setIsInitialLoading(false);
  }, [fetchEventsPage, recomputeTypes]);

  // Load RSVPs for current user
  useEffect(() => {
    if (!currentUser?.uid) return;

    let isMounted = true;
    const loadRsvps = async () => {
      const { rsvpMap: fetchedRsvps, eventIds } = await fetchUserRsvps(currentUser.uid);
      if (!isMounted) return;
      
      setRsvpMap(fetchedRsvps);

      // Now ensure we have EventItems for all these IDs
      // Filter out IDs that are already in discoverItems (optimization)
      // Note: discoverItems might update later, but this is an initial sync.
      // Ideally we check against the current state of discoverItems, but here we can just fetch all needed and dedup in useMemo.
      
      if (eventIds.length > 0) {
          const missingIds = eventIds; // Ideally filter, but safe to fetch again or improve logic.
          // Let's rely on fetchEventsByIds to be reasonably efficient or just fetch.
          // To be safe, let's fetch them.
          const fetchedEvents = await fetchEventsByIds(missingIds);
          if (isMounted) {
             setRsvpEventItems(fetchedEvents);
          }
      }
    };
    loadRsvps();
    return () => { isMounted = false; };
  }, [currentUser?.uid]);


  const loadMoreEvents = useCallback(async () => {
    if (isMoreEventsLoading || !hasMoreEvents) return;
    setIsMoreEventsLoading(true);
    const more = await fetchEventsPage(lastEventDoc);
    if (more.length) {
      setDiscoverItems((prev) => {
        const map = new Map<string, EventItem>();
        [...prev, ...more].forEach((e) => map.set(e.id, e));
        const merged = Array.from(map.values());
        recomputeTypes(merged);
        return merged;
      });
    }
    setIsMoreEventsLoading(false);
  }, [fetchEventsPage, lastEventDoc, isMoreEventsLoading, hasMoreEvents, recomputeTypes]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const hostingEvents = useMemo(
    () => sortEvents(hostingItems, hostingSort),
    [hostingItems, hostingSort]
  );

  const mergedEvents = useMemo(() => {
    const map = new Map<string, EventItem>();
    hostingItems.forEach((event) => map.set(event.id, event));
    discoverItems.forEach((event) => map.set(event.id, event));
    // Also include RSVP'd events if they aren't already there
    rsvpEventItems.forEach((event) => map.set(event.id, event));
    
    return Array.from(map.values());
  }, [hostingItems, discoverItems, rsvpEventItems]);

  const discoverEvents = useMemo(
    () =>
      applyFilters(
        mergedEvents, // Showing all known events in discover might be okay, or strictly discoverItems.
                      // For now, let's use discoverItems + new ones to avoid "popping" in if desired,
                      // but user asked for "Discover" tab to show events. Usually discover shows *all* public.
                      // So mergedEvents is fine.
        discoverQuery,
        discoverStatus,
        discoverType,
        discoverDateSort
      ),
    [mergedEvents, discoverQuery, discoverStatus, discoverType, discoverDateSort]
  );

  const yourEvents = useMemo(() => {
    const selected = mergedEvents.filter((event) => {
      const status = rsvpMap[event.id] ?? "none";
      return status !== "none" && status !== "notGoing";
    });
    return applyFilters(
      selected,
      yourQuery,
      yourStatus,
      yourType,
      yourDateSort
    );
  }, [mergedEvents, rsvpMap, yourQuery, yourStatus, yourType, yourDateSort]);

  const getRsvpStatus = useCallback(
    (id: string): RsvpStatus =>
      rsvpMap[id] ?? "none",
    [rsvpMap]
  );

  const setRsvpStatus = useCallback((id: string, status: RsvpStatus) => {
    // Optimistic Update
    setRsvpMap((prev) => ({ ...prev, [id]: status }));
    
    if (currentUser?.uid) {
        toggleEventRsvp(currentUser.uid, id, status).catch(err => {
            console.error("Failed to sync RSVP", err);
            // Revert on failure? For now silent fail or toast.
        });
    }
  }, [currentUser?.uid]);

  return {
    hostingEvents,
    yourEvents,
    discoverEvents,
    isInitialLoading,
    isHostingLoading,
    isMoreEventsLoading,
    hasMoreEvents,
    loadMoreEvents,
    error,
    addHostedEvent: (event: EventItem) => {
      setHostingItems((prev) => [event, ...prev]);
      setDiscoverItems((prev) => [event, ...prev]);
    },
    setHostingEvents: (events: EventItem[]) => {
      setHostingItems(events);
    },
    getRsvpStatus,
    setRsvpStatus,
    isMoreEventsLoading,
    hostingSortOptions: HOSTING_SORT_OPTIONS,
    hostingSort,
    setHostingSort,
    statusOptions: EVENT_STATUS_OPTIONS,
    typeOptions: typeOptionsState,
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

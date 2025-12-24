import type { EventItem } from "../discover/types";

export type EventSortOption = {
  id: string;
  label: string;
};

export type EventFilterOption = {
  id: string;
  label: string;
};

export type TimeZoneOption = {
  id: string;
  label: string;
};

export type EventsMockData = {
  hostingEvents: EventItem[];
  yourEvents: EventItem[];
  discoverEvents: EventItem[];
};

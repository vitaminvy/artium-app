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

export type EventGuest = {
  id: string;
  name: string;
  status: "going" | "maybe" | "invited" | "notGoing";
  ticketType?: string;
  quantity?: number;
  avatar?: string;
};

export type EventExhibitor = {
  id: string;
  name: string;
  status: "accepted" | "pending" | "declined";
  artwork?: string;
  booth?: string;
};

export type EventOrganizer = {
  name: string;
  handle?: string;
  avatar?: string;
  verified?: boolean;
};

export type EventDetail = {
  id: string;
  overview: {
    location: string;
    start: string; // ISO
    end: string; // ISO
    timeZone: string;
    visibility: string;
    description: string;
    organizer: EventOrganizer;
  };
  guests: EventGuest[];
  exhibitors: EventExhibitor[];
};

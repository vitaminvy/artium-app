import type { EventsMockData, EventFilterOption, EventSortOption } from "./types";

export const HOSTING_SORT_OPTIONS: EventSortOption[] = [
  { id: "newest", label: "Event Date (Newest)" },
  { id: "oldest", label: "Event Date (Oldest)" },
  { id: "attendees", label: "Most attendees" },
];

export const YOUR_EVENT_FILTERS: EventFilterOption[] = [
  { id: "upcoming", label: "Upcoming events" },
  { id: "type", label: "Event Type" },
  { id: "date", label: "Event Date" },
];

export const DISCOVER_EVENT_FILTERS: EventFilterOption[] = [
  { id: "all", label: "All events" },
  { id: "type", label: "Event Type" },
  { id: "date", label: "Event Date (Newest)" },
];

export const eventsMockData: EventsMockData = {
  hostingEvents: [],
  yourEvents: [],
  discoverEvents: [
    {
      id: "ev-201",
      title: "Contemporary Art Fair in the Carrousel du Louvre, Paris",
      location: "the Carrousel du Louvre, 99 Rue de Rivoli, Paris, France",
      datetime: "2026-10-23T21:00:00Z",
      image:
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
      category: "Exhibition, Art Fair",
      attendees: 1,
      status: "upcoming",
      rsvpLabel: "RSVP",
    },
    {
      id: "ev-202",
      title: "Canvas International Art Fair 2026, Venice",
      location: "Palazzo Albrizzi-Capello, Cannaregio, 4118, 30121 Venezia, Italy",
      datetime: "2026-01-23T20:00:00Z",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
      category: "Art Fair",
      attendees: 1,
      status: "upcoming",
      rsvpLabel: "RSVP",
    },
    {
      id: "ev-203",
      title: "River Lights Art Market, Zurich",
      location: "Limmatquai, Zurich, Switzerland",
      datetime: "2026-06-19T19:00:00Z",
      image:
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1400&q=80",
      category: "Exhibition, Market",
      attendees: 24,
      status: "upcoming",
      rsvpLabel: "RSVP",
    },
  ],
};

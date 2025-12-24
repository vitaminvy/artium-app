import type { EventDetail } from "./types";

export const eventDetails: EventDetail[] = [
  {
    id: "ev-201",
    overview: {
      location: "Fort Mason, San Francisco, CA, USA",
      start: "2026-03-20T06:00:00Z",
      end: "2026-03-23T08:00:00Z",
      timeZone: "UTC +07:00",
      visibility: "Public (Anyone on and off Cohart)",
      description:
        "I'm thrilled to be returning to Fort Mason Center for my second year at this celebrated San Francisco art fair. Join me as I showcase my latest wall sculptures - my boldest and brightest collection yet. This premier Bay Area event brings together discerning collectors and contemporary artists in a stunning waterfront setting. Stop by to see the work in person and discuss custom commissions!",
      organizer: {
        name: "Jennifer Patton",
        handle: "@jenniferpattonart",
        avatar:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
        verified: true,
      },
    },
    guests: [
      { id: "g1", name: "Hữu Phan", status: "going" },
      { id: "g2", name: "Linh Tran", status: "going", ticketType: "VIP", quantity: 2 },
      { id: "g3", name: "Minh Nguyen", status: "maybe", ticketType: "Standard", quantity: 1 },
      { id: "g4", name: "Quang Le", status: "invited" },
      { id: "g5", name: "My Pham", status: "going", quantity: 1 },
      { id: "g6", name: "Alex Doe", status: "maybe" },
      { id: "g7", name: "Taylor Smith", status: "invited" },
      { id: "g8", name: "Jamie Fox", status: "going", ticketType: "VIP" },
      { id: "g9", name: "Chris Lee", status: "invited" },
    ],
    exhibitors: [
      { id: "e1", name: "Studio Alba", status: "accepted", artwork: "Waves Series", booth: "A12" },
      { id: "e2", name: "Gallery Lumi", status: "pending", artwork: "Neon Dreams", booth: "B02" },
      { id: "e3", name: "ArtSpace Nine", status: "declined", artwork: "Monolith", booth: "C07" },
      { id: "e4", name: "Atelier North", status: "accepted", artwork: "Glass Forms", booth: "D10" },
      { id: "e5", name: "Paper Crane Studio", status: "pending", artwork: "Paper Bloom", booth: "E04" },
      { id: "e6", name: "Blue Dot Collective", status: "accepted", artwork: "Azure Line", booth: "F03" },
      { id: "e7", name: "Canvas Lab", status: "pending", artwork: "Chromatic", booth: "G11" },
      { id: "e8", name: "Muse Gallery", status: "pending", artwork: "Shards", booth: "H05" },
    ],
  },
];

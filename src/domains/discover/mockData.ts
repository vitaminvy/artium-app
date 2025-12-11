import {
  ArtistProfile,
  Artwork,
  DiscoverData,
  EventItem,
  InspirationArticle,
} from "./types";

const artworks: Artwork[] = [
  {
    id: "aw-1",
    title: "Make it rain",
    artist: "Edward Granger",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    artistAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    isTrending: true,
    spice: true,
    location: "Nice, France",
  },
  {
    id: "aw-2",
    title: "Quiet Form",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1523419400524-fc1e1cc2d6c5?auto=format&fit=crop&w=900&q=80",
    isTrending: true,
  },
  {
    id: "aw-3",
    title: "City Lights",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    spice: true,
  },
  {
    id: "aw-4",
    title: "Digital Bloom",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "aw-5",
    title: "Blue Cluster",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "aw-6",
    title: "Stop Being Poor",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1474286631363-5d98f2b4de00?auto=format&fit=crop&w=900&q=80",
    isTrending: true,
  },
  {
    id: "aw-7",
    title: "Gel Ball",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1512238701577-f182d9ef8af7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "aw-8",
    title: "Mirror Geometry",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    spice: true,
  },
];

const moments: Artwork[] = [
  {
    id: "mo-1",
    title: "Studio glimpse",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1523419400524-fc1e1cc2d6c5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mo-2",
    title: "Process shot",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mo-3",
    title: "Gallery visit",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1465311440653-ba9b1d9b0f5b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "mo-4",
    title: "Outdoor ride",
    artist: "Artist Name",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
];

const profiles: ArtistProfile[] = [
  {
    id: "pf-1",
    name: "Xooang Choi",
    title: "Sculptor",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: "pf-2",
    name: "Sha'an dAnthers",
    title: "Illustrator",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "pf-3",
    name: "Louise Zhang",
    title: "Painter",
    avatar:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: "pf-4",
    name: "Marcella Liunic",
    title: "Visual Artist",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "pf-5",
    name: "David Hockney",
    title: "Painter",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "pf-6",
    name: "Louise Zhang",
    title: "Artist",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
  },
];

const events: EventItem[] = [
  {
    id: "ev-1",
    title: "Cohart x J Studio Exclusive Dinner",
    location: "Ho Chi Minh City, Vietnam",
    datetime: "2025-04-29T18:00:00Z",
    image:
      "https://images.unsplash.com/photo-1523419400524-fc1e1cc2d6c5?auto=format&fit=crop&w=1000&q=80",
    attendees: 26,
    status: "ongoing",
    rsvpLabel: "RSVP",
  },
  {
    id: "ev-2",
    title: "Group Exhibition: Design, Desire, Disaster",
    location: "Kuala Lumpur, Malaysia",
    datetime: "2025-03-20T08:00:00Z",
    image:
      "https://images.unsplash.com/photo-1529429617124-aee1f1650a5c?auto=format&fit=crop&w=1000&q=80",
    attendees: 6,
    status: "upcoming",
    rsvpLabel: "Invite",
  },
  {
    id: "ev-3",
    title: "Workshop: Innovate and Create",
    location: "Tokyo, Japan",
    datetime: "2025-04-15T09:00:00Z",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
    attendees: 12,
    status: "upcoming",
    rsvpLabel: "RSVP",
  },
  {
    id: "ev-4",
    title: "Conference Design for the Future",
    location: "Berlin, Germany",
    datetime: "2025-05-10T09:00:00Z",
    image:
      "https://images.unsplash.com/photo-1515165562835-c3b8c9ea0f5b?auto=format&fit=crop&w=1000&q=80",
    attendees: 18,
    status: "upcoming",
    rsvpLabel: "Invite",
  },
];

const inspirations: InspirationArticle[] = [
  {
    id: "in-1",
    title: "4 Reasons Looking at Art is Good for Your Brain",
    category: "Blog",
    author: "Susan Washington",
    publishedAt: "2025-08-21T00:00:00Z",
    readTime: "5 mins read",
    image:
      "https://images.unsplash.com/photo-1529429617124-aee1f1650a5c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "in-2",
    title: "See “Perfectly Imperfect” by Bermano",
    category: "Spotlight",
    author: "Kendal Watson",
    publishedAt: "2025-08-21T00:00:00Z",
    readTime: "5 mins read",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "in-3",
    title: "Discover Art Tailored to Your Taste",
    category: "Blog",
    author: "Susan Washington",
    publishedAt: "2025-08-20T00:00:00Z",
    readTime: "4 mins read",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
];

export const discoverMockData: DiscoverData = {
  artworks,
  profiles,
  moments,
  events,
  inspirations,
};

export const defaultDiscoverTab = "topPicks" as const;

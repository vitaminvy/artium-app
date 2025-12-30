import {
  ArtistProfile,
  Artwork,
  DiscoverData,
  DiscoverMoment,
  EventItem,
  InspirationArticle,
} from "./types";
import type { FeedPost, FeedMedia } from "../feed/types";

const artworks: Artwork[] = [
  {
    id: "artwork-august",
    title: "August",
    artist: "Jeff Yarrington",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    artistAvatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    isTrending: true,
    price: "USD $550",
    location: "Albuquerque, NM, USA",
  },
  {
    id: "artwork-city-lights",
    title: "City Lights",
    artist: "Maria Rodriguez",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    artistAvatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
    isTrending: true,
    price: "USD $1200",
  },
  {
    id: "artwork-digital-dreamscape",
    title: "Digital Dreamscape",
    artist: "Chen Wei",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
    artistAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
    price: "USD $800",
  },
  {
    id: "artwork-quiet-reflection",
    title: "Quiet Reflection",
    artist: "Jeff Yarrington",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    artistAvatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    price: "USD $700",
  },
];

const mockMomentSeed: Artwork[] = [
  {
    id: "mo-1",
    title: "Studio prep for August drop",
    artist: "Jeff Yarrington",
    artistAvatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "mo-2",
    title: "City Lights in progress",
    artist: "Maria Rodriguez",
    artistAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "mo-3",
    title: "Metallic print preview",
    artist: "Chen Wei",
    artistAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80",
  },
];

const moments: DiscoverMoment[] = mockMomentSeed.map((m) => {
  const authorHandle = m.artist.replace(/\s+/g, "").toLowerCase();
  const media: FeedMedia = { type: "image", items: [m.image] };
  const metrics = { likes: 24, comments: 3, shares: 1 };
  const post: FeedPost = {
    id: m.id,
    author: {
      id: m.id,
      name: m.artist,
      handle: authorHandle,
      avatar: m.artistAvatar,
      verified: true,
    },
    content: m.title,
    createdAt: Date.now(),
    media,
    metrics,
    liked: false,
    relativeTime: "1m",
  };

  return {
    id: m.id,
    card: {
      id: m.id,
      author: post.author,
      title: m.title,
      content: m.title,
      media,
      metrics,
      liked: false,
      relativeTime: "1m",
    },
    post,
  };
});

const profiles: ArtistProfile[] = [
  {
    id: "pf-1",
    name: "Jeff Yarrington",
    title: "Painter",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
  {
    id: "pf-2",
    name: "Maria Rodriguez",
    title: "Abstract Painter",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "pf-3",
    name: "Chen Wei",
    title: "Digital Artist",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    verified: true,
  },
];

const events: EventItem[] = [
  {
    id: "ev-1",
    title: "Artium x J Studio Exclusive Dinner",
    location: "Ho Chi Minh City, Vietnam",
    datetime: "2025-04-29T18:00:00Z",
    createdAt: "2025-02-01T10:00:00Z",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1400&q=80",
    category: "Dinner, Networking",
    eventType: "Other",
    attendees: 26,
    status: "ongoing",
    rsvpLabel: "RSVP",
  },
  {
    id: "ev-2",
    title: "Group Exhibition: Design, Desire, Disaster",
    location: "Kuala Lumpur, Malaysia",
    datetime: "2025-03-20T08:00:00Z",
    createdAt: "2025-01-18T09:30:00Z",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    category: "Exhibition",
    eventType: "Exhibition",
    attendees: 6,
    status: "upcoming",
    rsvpLabel: "Invite",
  },
  {
    id: "ev-3",
    title: "Workshop: Innovate and Create",
    location: "Tokyo, Japan",
    datetime: "2025-04-15T09:00:00Z",
    createdAt: "2025-02-22T13:00:00Z",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    category: "Workshop",
    eventType: "Workshop",
    attendees: 12,
    status: "upcoming",
    rsvpLabel: "RSVP",
  },
  {
    id: "ev-4",
    title: "Conference Design for the Future",
    location: "Berlin, Germany",
    datetime: "2025-05-10T09:00:00Z",
    createdAt: "2025-03-02T10:30:00Z",
    image:
      "https://images.unsplash.com/photo-1515165562835-c3b8c9ea0f5b?auto=format&fit=crop&w=1000&q=80",
    category: "Conference",
    eventType: "Panel Talk",
    attendees: 18,
    status: "upcoming",
    rsvpLabel: "Invite",
  },
];

export const discoverMockData: DiscoverData = {
  artworks,
  profiles,
  moments,
  events,
};

export const defaultDiscoverTab = "topPicks" as const;

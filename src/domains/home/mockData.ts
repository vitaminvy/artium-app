import {
  HomeBlogItem,
  HomeData,
  HomeEventItem,
  HomeFollowingProfile,
  HomeNewsItem,
  HomeSellItem,
} from "./types";

const news: HomeNewsItem[] = [
  {
    id: "news-1",
    title:
      "Maryland Art Place presents UNDER $2,500: Building Baltimore's Art Future",
    dateLabel: "Nov 20, 2025",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    tag: "NEWS",
  },
  {
    id: "news-2",
    title: "Global Gallery Week: Pop-up shows across six cities",
    dateLabel: "Dec 04, 2025",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    tag: "NEWS",
  },
  {
    id: "news-3",
    title: "Collector Spotlight: Micro patronage is reshaping art funding",
    dateLabel: "Dec 12, 2025",
    image:
      "https://images.unsplash.com/photo-1515165562835-c3b8c9ea0f5b?auto=format&fit=crop&w=1600&q=80",
    tag: "NEWS",
  },
];

const blogs: HomeBlogItem[] = [
  {
    id: "blog-1",
    title: "Sell art, with just a tap",
    author: "Kendall Warson",
    dateLabel: "November 26, 2025",
    image:
      "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
    authorAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
];

const events: HomeEventItem[] = [
  {
    id: "event-1",
    title: "Photographing Your Artwork: A Conversation with Michael Daks",
    dateLabel: "Nov 30, 2025",
    dateISO: "2025-11-30T00:00:00Z",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    label: "UPCOMING EVENT",
  },
];

const sellItems: HomeSellItem[] = [
  {
    id: "sell-1",
    title: "Belle de nuit",
    artist: "Ernest Compta",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    price: "$4,000",
    artistAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: "sell-2",
    title: "I've seen it",
    artist: "Ernest Compta",
    image:
      "https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=80",
    price: "$4,000",
    artistAvatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  {
    id: "sell-3",
    title: "Quiet Form",
    artist: "Aya Tan",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    price: "$2,300",
    artistAvatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "sell-4",
    title: "Digital Bloom",
    artist: "Mara Klein",
    image:
      "https://images.unsplash.com/photo-1523419400524-fc1e1cc2d6c5?auto=format&fit=crop&w=1200&q=80",
    price: "$1,150",
    artistAvatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
  },
];

const following: HomeFollowingProfile[] = [
  {
    id: "follow-1",
    name: "Yohei Yama",
    subtitle: "designer",
    avatar:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80",
    verified: true,
    actionLabel: "Follow",
  },
  {
    id: "follow-2",
    name: "Linh Duong",
    subtitle: "they/them - designer",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
    verified: true,
    actionLabel: "Follow",
  },
  {
    id: "follow-3",
    name: "Mia Reyes",
    subtitle: "illustrator",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-4",
    name: "Armand Lee",
    subtitle: "sculptor",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    actionLabel: "Follow",
  },
];

export const homeMockData: HomeData = {
  news,
  blogs,
  events,
  sellItems,
  following,
};

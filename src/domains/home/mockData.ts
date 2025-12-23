import {
  HomeBlogItem,
  HomeData,
  HomeEventItem,
  HomeFollowingProfile,
  HomeNewsItem,
} from "./types";
import { discoverMockData } from "../discover/mockData";

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
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
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

const sellItems = discoverMockData.artworks;

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
  {
    id: "follow-5",
    name: "Piers Midwinter",
    subtitle: "artist, teacher, explorer",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=520&q=80",
    verified: true,
    actionLabel: "Follow",
  },
  {
    id: "follow-6",
    name: "Le Thuy",
    subtitle: "artist",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=80",
    verified: true,
    actionLabel: "Follow",
  },
  {
    id: "follow-7",
    name: "Mahdi Abdullah",
    subtitle: "artist",
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=520&q=80",
    verified: true,
    actionLabel: "Follow",
  },
  {
    id: "follow-8",
    name: "Karine Guillermin",
    subtitle: "artist painter / sculptor",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=520&q=80",
    verified: true,
    actionLabel: "Follow",
  },
  {
    id: "follow-9",
    name: "Zara Quinn",
    subtitle: "visual artist",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=520&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-10",
    name: "Shin Park",
    subtitle: "photographer",
    avatar:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=520&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-11",
    name: "Mira Patel",
    subtitle: "designer",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=520&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-12",
    name: "Bruno Silva",
    subtitle: "illustrator",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=520&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-13",
    name: "Nora James",
    subtitle: "sculptor",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-14",
    name: "Hanna Lee",
    subtitle: "painter",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=520&q=80",
    actionLabel: "Follow",
  },
  {
    id: "follow-15",
    name: "Noah Trent",
    subtitle: "digital artist",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=520&q=80",
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

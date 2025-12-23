import { Artist, Artwork, Folder } from "./types";

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: "artwork-august",
    title: "August",
    artist: "Jeff Yarrington",
    year: 2025,
    price: "USD $550",
    status: "Available",
    folder: "New Arrivals",
    dimensions: "24 x 30 in",
    thumbnail:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "artwork-city-lights",
    title: "City Lights",
    artist: "Maria Rodriguez",
    year: 2024,
    price: "USD $1200",
    status: "On Hold",
    folder: "Study Series",
    dimensions: "36 x 48 in",
    thumbnail:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "artwork-digital-dreamscape",
    title: "Digital Dreamscape",
    artist: "Chen Wei",
    year: 2025,
    price: "USD $800",
    status: "Available",
    folder: "Minimal",
    dimensions: "20 x 20 in",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "artwork-quiet-reflection",
    title: "Quiet Reflection",
    artist: "Jeff Yarrington",
    year: 2023,
    price: "USD $700",
    status: "Sold",
    folder: "Archive",
    dimensions: "28 x 22 in",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
];

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: "ar-1",
    name: "Jeff Yarrington",
    origin: "Albuquerque, USA",
    artworks: 6,
    represented: true,
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-2",
    name: "Maria Rodriguez",
    origin: "Mexico City, Mexico",
    artworks: 12,
    represented: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-3",
    name: "Chen Wei",
    origin: "Shanghai, China",
    artworks: 9,
    represented: true,
    avatar:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
  },
];

export const INITIAL_FOLDERS: Folder[] = [
  { id: "fd-1", name: "New Arrivals", count: 8, tone: "#F8FAFC" },
  { id: "fd-2", name: "Minimal", count: 6, tone: "#F8FAFC" },
  { id: "fd-3", name: "Study Series", count: 3, tone: "#F8FAFC" },
  { id: "fd-4", name: "Archive", count: 11, tone: "#F8FAFC" },
];

import { Artist, Artwork, Folder } from "./types";

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: "aw-1",
    title: "Midnight Bloom",
    artist: "Harper Liu",
    year: 2023,
    price: "$3,800",
    status: "Available",
    folder: "New Arrivals",
    dimensions: "24 x 36 in",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-2",
    title: "Lines of Silence",
    artist: "Jonas K.",
    year: 2021,
    price: "$2,600",
    status: "On Hold",
    folder: "Minimal",
    dimensions: "30 x 30 in",
    thumbnail:
      "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-3",
    title: "Field Notes",
    artist: "Amira Patel",
    year: 2022,
    price: "$4,500",
    status: "Sold",
    folder: "Archive",
    dimensions: "40 x 52 in",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-4",
    title: "Tide Pool Study",
    artist: "Elliot Marsh",
    year: 2020,
    price: "$1,950",
    status: "Available",
    folder: "Study Series",
    dimensions: "18 x 24 in",
    thumbnail:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-5",
    title: "Aurora Fragment",
    artist: "Linh Tran",
    year: 2023,
    price: "$6,200",
    status: "Available",
    folder: "New Arrivals",
    dimensions: "32 x 48 in",
    thumbnail:
      "https://images.unsplash.com/photo-1523419400524-1d9233d82db0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-6",
    title: "Soft Geometry",
    artist: "Mara Silas",
    year: 2019,
    price: "$2,100",
    status: "On Hold",
    folder: "Minimal",
    dimensions: "22 x 30 in",
    thumbnail:
      "https://images.unsplash.com/photo-1496482475496-a91f31e0386a?auto=format&fit=crop&w=800&q=80",
  },
];

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: "ar-1",
    name: "Harper Liu",
    origin: "Los Angeles, USA",
    artworks: 18,
    represented: true,
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-2",
    name: "Linh Tran",
    origin: "Da Nang, Vietnam",
    artworks: 25,
    represented: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-3",
    name: "Elliot Marsh",
    origin: "Copenhagen, Denmark",
    artworks: 14,
    represented: true,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-4",
    name: "Mara Silas",
    origin: "Toronto, Canada",
    artworks: 9,
    represented: false,
    avatar:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80",
  },
];

export const INITIAL_FOLDERS: Folder[] = [
  { id: "fd-1", name: "New Arrivals", count: 8, tone: "#F8FAFC" },
  { id: "fd-2", name: "Minimal", count: 6, tone: "#F8FAFC" },
  { id: "fd-3", name: "Study Series", count: 3, tone: "#F8FAFC" },
  { id: "fd-4", name: "Archive", count: 11, tone: "#F8FAFC" },
];

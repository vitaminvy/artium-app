import { ArtworkDetail } from "./types";

export const fallbackDetail: ArtworkDetail = {
  id: "aw-1",
  title: "August",
  artist: {
    name: "Jeff Yarrington",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    verified: true,
  },
  stats: {
    worksSold: 4,
    buyers: 3,
  },
  price: "USD $550",
  availabilityNote: "Only 1 available. Get yours now!",
  images: [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  ],
  tags: [
    "Joyful",
    "Natural",
    "Vibrant",
    "Expressive",
    "Peaceful",
    "Bold",
    "Moody",
    "Minimalist",
    "Vintage",
    "Spiritual",
    "Painting",
    "Human Experience",
    "Futurism",
    "Environment",
    "Escapism",
    "Universal",
  ],
  dimension: { h: 24, w: 30, d: 2, unit: "in" },
  weight: "8.00 lbs",
  year: 2025,
  edition: 1,
  materials: "Acrylic on canvas with real wood floating frame",
  shipping: [
    { title: "Shipped within 7 working days in a box" },
    { title: "Artium Satisfaction Guarantee" },
  ],
};

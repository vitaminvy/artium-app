export type ArtworkDetail = {
  id: string;
  title: string;
  artist: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  stats: {
    worksSold: number;
    buyers: number;
  };
  price: string;
  availabilityNote?: string;
  images: string[];
  tags: string[];
  dimension: { h: number; w: number; d: number; unit: string };
  weight: string;
  year: number;
  edition: number;
  materials: string;
  shipping: { title: string; subtitle?: string }[];
};
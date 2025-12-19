export type InventoryImage = {
  uri: string;
  width?: number;
  height?: number;
};

export type ListingStatus = "for_sale" | "inquire" | "sold";
export type Unit = "in" | "cm";
export type WeightUnit = "lbs" | "kg";

export type InventoryDetails = {
  title: string;
  description: string;
  year: string;
  edition: string;
  materials: string;
  price: string;
  quantity: string;
  dimensions: {
    unit: Unit;
    height: string;
    width: string;
    depth: string;
  };
  weight: {
    unit: WeightUnit;
    value: string;
  };
  status: ListingStatus;
  hasFrame: boolean;
};

export type MediaSource = "camera" | "library";

// --- New Types for Inventory List ---

export type InventoryStatus = "Available" | "On Hold" | "Sold";

export type Artwork = {
  id: string;
  title: string;
  artist: string;
  year: number;
  price: string;
  status: InventoryStatus;
  folder: string;
  thumbnail: string;
  dimensions: string;
};

export type Artist = {
  id: string;
  name: string;
  origin: string;
  artworks: number;
  represented: boolean;
  avatar: string;
};

export type Folder = { id: string; name: string; count: number; tone: string };

export const VIEW_MODES = [
  { key: "grid", icon: "grid-outline", label: "Grid" },
  { key: "list", icon: "list-outline", label: "List" },
] as const;

export type ViewMode = (typeof VIEW_MODES)[number]["key"];

import { InventoryDetails } from "./types";

export const STEPS = ["Upload images", "Artwork details", "Tags & Moments"];
export const MAX_IMAGES = 5;

export const INITIAL_DETAILS: InventoryDetails = {
  title: "",
  description: "",
  year: "",
  edition: "",
  materials: "",
  price: "",
  quantity: "",
  dimensions: {
    unit: "in",
    height: "",
    width: "",
    depth: "",
  },
  weight: {
    unit: "lbs",
    value: "",
  },
  status: "for_sale",
  hasFrame: false,
};

export const LISTING_STATUS_OPTIONS = [
  { value: "for_sale", label: "For Sale" },
  { value: "inquire", label: "Inquire to Purchase" },
  { value: "sold", label: "Sold", pro: true, disabled: true },
];

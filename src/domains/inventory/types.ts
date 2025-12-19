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

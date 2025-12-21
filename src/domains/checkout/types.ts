export type DeliveryMethod = "artium" | "seller";

export type AddressForm = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  postalCode: string;
  address1: string;
  address2: string;
  state: string;
  city: string;
  phone: string;
};

export type SelectionType = "country" | "state" | "city";

export type LocationErrors = {
  countries?: string;
  states?: string;
  cities?: string;
};

export type AddressFieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "country"
  | "postalCode"
  | "address1"
  | "state"
  | "phone";

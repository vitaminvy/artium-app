import { AddressFieldKey, AddressForm } from "./types";

export const REQUIRED_FIELDS: AddressFieldKey[] = [
  "firstName",
  "lastName",
  "email",
  "country",
  "postalCode",
  "address1",
  "state",
  "phone",
];

export const FIELD_ORDER: AddressFieldKey[] = [
  "firstName",
  "lastName",
  "email",
  "country",
  "postalCode",
  "address1",
  "state",
  "phone",
];

export const createEmptyAddress = (): AddressForm => ({
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  postalCode: "",
  address1: "",
  address2: "",
  state: "",
  city: "",
  phone: "",
});

export const LOCATION_API = "https://countriesnow.space/api/v0.1";

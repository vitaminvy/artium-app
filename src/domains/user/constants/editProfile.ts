import { EditProfileFormValues } from "../types";

export type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

export const EDIT_PROFILE_LIMITS = {
  username: 30,
  firstName: 30,
  lastName: 30,
  phoneNumber: 30,
  address: 120,
};

export const EDIT_PROFILE_LABELS = {
  headerTitle: "Edit Profile",
  save: "Save Changes",
  basicInfo: "Basic Information",
  profilePicture: "Profile Picture",
  username: "Username",
  usernameHint: "Your unique handle so others can find you",
  firstName: "First Name / Brand Name",
  lastName: "Last Name (Optional)",
  phoneNumber: "Phone Number",
  address: "Address",
};

export const EDIT_PROFILE_DEFAULTS: EditProfileFormValues = {
  countryCode: "VN",
  username: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  address: "",
};

export const EDIT_PROFILE_COUNTRY_FALLBACKS: CountryOption[] = [
  { code: "VN", name: "Vietnam", dialCode: "+84" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "CA", name: "Canada", dialCode: "+1" },
];

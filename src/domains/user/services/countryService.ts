import { CountryOption } from "../constants/editProfile";

type CountryApiItem = {
  cca2?: string;
  name?: { common?: string };
  idd?: { root?: string; suffixes?: string[] };
};

const COUNTRY_API_URL =
  "https://restcountries.com/v3.1/all?fields=cca2,name,idd";

let cachedOptions: CountryOption[] | null = null;
let inFlight: Promise<CountryOption[]> | null = null;

const toDialCode = (root?: string, suffixes?: string[]) => {
  if (!root) return "";
  if (!suffixes?.length) return root;
  if (suffixes.length === 1) return `${root}${suffixes[0]}`;
  return root;
};

export async function fetchCountryOptions(): Promise<CountryOption[]> {
  if (cachedOptions) return cachedOptions;
  if (inFlight) return inFlight;

  inFlight = fetch(COUNTRY_API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load countries");
      }
      return response.json() as Promise<CountryApiItem[]>;
    })
    .then((items) =>
      items
        .map((item) => {
          const code = item.cca2?.toUpperCase();
          const name = item.name?.common?.trim();
          const dialCode = toDialCode(item.idd?.root, item.idd?.suffixes);
          if (!code || !name || !dialCode) return null;
          return { code, name, dialCode };
        })
        .filter((item): item is CountryOption => Boolean(item))
        .sort((a, b) => a.name.localeCompare(b.name))
    )
    .then((options) => {
      cachedOptions = options;
      return options;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

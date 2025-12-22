import { useCallback, useEffect, useRef, useState } from "react";
import { LOCATION_API } from "../constants";

export function useLocationData() {
  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  
  const [locationErrors, setLocationErrors] = useState<{
    countries?: string;
    states?: string;
    cities?: string;
  }>({});

  const loadingCountriesRef = useRef(false);
  const countriesLoadedRef = useRef(false);

  const loadCountries = useCallback(async () => {
    if (loadingCountriesRef.current || countriesLoadedRef.current) return;
    loadingCountriesRef.current = true;
    setLoadingCountries(true);
    setLocationErrors((prev) => ({ ...prev, countries: undefined }));
    try {
      const res = await fetch(`${LOCATION_API}/countries`);
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.msg || "Failed to load countries");
      }
      const list = Array.isArray(json?.data)
        ? json.data
            .map((item: any) => item?.country ?? item?.name)
            .filter(Boolean)
        : [];
      setCountries(list);
      if (list.length > 0) {
        countriesLoadedRef.current = true;
      }
    } catch (err: any) {
      setLocationErrors((prev) => ({
        ...prev,
        countries: err?.message || "Unable to load countries",
      }));
    } finally {
      loadingCountriesRef.current = false;
      setLoadingCountries(false);
    }
  }, []);

  const loadStates = useCallback(
    async (countryName: string) => {
      if (!countryName || loadingStates) return;
      setLoadingStates(true);
      setLocationErrors((prev) => ({ ...prev, states: undefined }));
      try {
        const res = await fetch(`${LOCATION_API}/countries/states`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName }),
        });
        const json = await res.json();
        if (!res.ok || json?.error) {
          throw new Error(json?.msg || "Failed to load states");
        }
        const list = Array.isArray(json?.data?.states)
          ? json.data.states.map((item: any) => item?.name).filter(Boolean)
          : [];
        setStates(list);
      } catch (err: any) {
        setLocationErrors((prev) => ({
          ...prev,
          states: err?.message || "Unable to load states",
        }));
      } finally {
        setLoadingStates(false);
      }
    },
    [loadingStates]
  );

  const loadCities = useCallback(
    async (countryName: string, stateName: string) => {
      if (!countryName || !stateName || loadingCities) return;
      setLoadingCities(true);
      setLocationErrors((prev) => ({ ...prev, cities: undefined }));
      try {
        const res = await fetch(`${LOCATION_API}/countries/state/cities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName, state: stateName }),
        });
        const json = await res.json();
        if (!res.ok || json?.error) {
          throw new Error(json?.msg || "Failed to load cities");
        }
        const list = Array.isArray(json?.data)
          ? json.data.filter(Boolean)
          : [];
        setCities(list);
      } catch (err: any) {
        setLocationErrors((prev) => ({
          ...prev,
          cities: err?.message || "Unable to load cities",
        }));
      } finally {
        setLoadingCities(false);
      }
    },
    [loadingCities]
  );

  useEffect(() => {
    void loadCountries();
  }, [loadCountries]);

  return {
    countries,
    states,
    cities,
    loadingCountries,
    loadingStates,
    loadingCities,
    locationErrors,
    loadCountries,
    loadStates,
    loadCities,
    setStates,
    setCities
  };
}

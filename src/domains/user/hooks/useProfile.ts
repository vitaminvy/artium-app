import { useMemo, useState } from "react";
import { profileMockData } from "../mockData";
import { ProfileTabKey, ProfileViewModel } from "../types";

type UseProfileResult = {
  profile: ProfileViewModel;
  tab: ProfileTabKey;
  setTab: (tab: ProfileTabKey) => void;
};

export function useProfile(): UseProfileResult {
  const [tab, setTab] = useState<ProfileTabKey>("overview");

  // Memoized mock to mimic future data loading
  const profile = useMemo(() => profileMockData, []);

  return {
    profile,
    tab,
    setTab,
  };
}

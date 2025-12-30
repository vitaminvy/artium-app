import { useState } from "react";
import { ProfileTabKey, ProfileViewModel } from "../types";
import { useProfileContext } from "../contexts/ProfileContext";

type UseProfileResult = {
  profile: ProfileViewModel;
  tab: ProfileTabKey;
  isLoading: boolean;
  setTab: (tab: ProfileTabKey) => void;
  refreshProfile: () => Promise<void>;
};

export function useProfile(): UseProfileResult {
  const [tab, setTab] = useState<ProfileTabKey>("overview");
  const { profile, isLoading, refreshProfile } = useProfileContext();

  return {
    profile,
    tab,
    isLoading,
    setTab,
    refreshProfile,
  };
}

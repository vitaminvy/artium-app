import { useState } from "react";
import { ProfileTabKey, ProfileViewModel } from "../types";
import { useProfileContext } from "../contexts/ProfileContext";

type UseProfileResult = {
  profile: ProfileViewModel;
  tab: ProfileTabKey;
  setTab: (tab: ProfileTabKey) => void;
};

export function useProfile(): UseProfileResult {
  const [tab, setTab] = useState<ProfileTabKey>("overview");
  const { profile } = useProfileContext();

  return {
    profile,
    tab,
    setTab,
  };
}

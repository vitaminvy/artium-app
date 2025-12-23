import { ProfileViewModel } from "./types";
import { PROFILE_ACCENT } from "./constants/profile";

export const profileMockData: ProfileViewModel = {
  user: {
    id: "user-001",
    name: "User",
    handle: "",
    avatarColor: PROFILE_ACCENT,
    avatarLabel: "U",
  },
  stats: {
    followers: 0,
    following: 0,
  },
  featuredArtworks: [],
  moodboards: [],
};

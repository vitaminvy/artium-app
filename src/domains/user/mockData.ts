import { ProfileViewModel } from "./types";
import { PROFILE_ACCENT } from "./constants/profile";

export const profileMockData: ProfileViewModel = {
  user: {
    id: "user-001",
    name: "Huu Phan",
    handle: "@huutr372390",
    avatarColor: PROFILE_ACCENT,
    avatarLabel: "C",
  },
  stats: {
    followers: 3,
    following: 2,
  },
  featuredArtworks: [],
  moodboards: [
    {
      id: "mood-1",
      title: "Private Moodboard",
      visibility: "private",
      ownerName: "Huu Phan",
      previewColor: "#FFFFFF",
    },
  ],
};

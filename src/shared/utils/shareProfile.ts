import { Share } from "react-native";
import { ProfileUser, ProfileStats } from "../../domains/user/types";

type ShareProfilePayload = {
  user: ProfileUser;
  stats?: ProfileStats;
  deepLink?: string;
};

export async function shareProfile({ user, stats, deepLink }: ShareProfilePayload) {
  const lines = [
    user.name,
    user.handle,
    stats ? `${stats.followers} followers · ${stats.following} following` : undefined,
    deepLink ?? `https://www.artium.com/user/${user.id ?? "me"}`,
  ].filter(Boolean);

  const message = lines.join("\n");
  if (!message) return;

  try {
    await Share.share({ message, url: deepLink });
  } catch (err) {
    console.warn("Share profile failed:", err);
  }
}

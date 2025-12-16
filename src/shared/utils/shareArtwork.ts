import { Share } from "react-native";

export type ShareArtworkPayload = {
  title?: string;
  artistName?: string;
  marketing?: string;
  deepLink?: string;
};

export async function shareArtwork(payload: ShareArtworkPayload) {
  const { title, artistName, marketing, deepLink } = payload;

  const lines = [
    title ? `“${title}”` : undefined,
    artistName ? `by ${artistName}` : undefined,
    marketing ?? "Khám phá tác phẩm này",
    deepLink,
  ].filter(Boolean);

  const message = lines.join("\n");
  if (!message) return;

  try {
    await Share.share({ message, url: deepLink });
  } catch (err) {
    console.warn("Share failed:", err);
  }
}

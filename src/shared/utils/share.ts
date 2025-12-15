import { Linking } from "react-native";

type ShareTarget = "whatsapp" | "facebook" | "twitter" | "linkedin" | "telegram" | "link";

const deepLinkBuilders: Record<ShareTarget, (url: string, text?: string) => string> = {
  whatsapp: (url, text) =>
    `whatsapp://send?text=${encodeURIComponent(text ?? url)}`,
  facebook: (url) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url, text) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      text ?? ""
    )}`,
  linkedin: (url) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  telegram: (url, text) =>
    `tg://msg?text=${encodeURIComponent(text ?? url)}`,
  link: (url) => url,
};

const fallbacks: Partial<Record<ShareTarget, (url: string, text?: string) => string>> = {
  telegram: (url, text) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      text ?? ""
    )}`,
};

export async function openShareLink(target: ShareTarget, url: string, text?: string) {
  try {
    const deep = deepLinkBuilders[target]?.(url, text) ?? url;
    const canOpen = await Linking.canOpenURL(deep);
    if (canOpen) {
      await Linking.openURL(deep);
      return;
    }
    const fallback = fallbacks[target]?.(url, text);
    if (fallback) {
      await Linking.openURL(fallback);
      return;
    }
    // Final fallback
    await Linking.openURL(url);
  } catch (err) {
    console.warn("openShareLink error", err);
  }
}

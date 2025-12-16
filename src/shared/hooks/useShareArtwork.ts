import { useCallback } from "react";
import { ShareArtworkPayload, shareArtwork } from "../utils/shareArtwork";

export function useShareArtwork(payload: ShareArtworkPayload) {
  return useCallback(() => shareArtwork(payload), [payload]);
}

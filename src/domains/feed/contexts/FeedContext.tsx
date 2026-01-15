import React, { createContext, useCallback, useContext, useRef } from "react";

type FeedContextValue = {
  registerRefresh: (refreshFn: () => Promise<void>) => void;
  unregisterRefresh: () => void;
  refreshFeed: () => Promise<void>;
};

const FeedContext = createContext<FeedContextValue>({
  registerRefresh: () => {},
  unregisterRefresh: () => {},
  refreshFeed: async () => {},
});

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const refreshFnRef = useRef<(() => Promise<void>) | null>(null);

  const registerRefresh = useCallback((refreshFn: () => Promise<void>) => {
    refreshFnRef.current = refreshFn;
  }, []);

  const unregisterRefresh = useCallback(() => {
    refreshFnRef.current = null;
  }, []);

  const refreshFeed = useCallback(async () => {
    if (refreshFnRef.current) {
      await refreshFnRef.current();
    }
  }, []);

  return (
    <FeedContext.Provider value={{ registerRefresh, unregisterRefresh, refreshFeed }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeedContext = () => useContext(FeedContext);

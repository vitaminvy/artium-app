import React, { createContext, useContext, useMemo, useState } from "react";

type TabBarVisibilityContextValue = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  height: number;
  setHeight: (height: number) => void;
  lastTab: string | null;
  setLastTab: (tab: string | null) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue>({
  hidden: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHidden: () => {},
  height: 72,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHeight: () => {},
  lastTab: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLastTab: () => {},
});

export function TabBarVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const [height, setHeight] = useState(72);
  const [lastTab, setLastTab] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      hidden,
      setHidden,
      height,
      setHeight,
      lastTab,
      setLastTab,
    }),
    [hidden, height, lastTab]
  );

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
}

export function useTabBarVisibility() {
  return useContext(TabBarVisibilityContext);
}

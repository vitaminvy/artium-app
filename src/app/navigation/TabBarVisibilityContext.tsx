import React, { createContext, useContext, useMemo, useState } from "react";

type TabBarVisibilityContextValue = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  height: number;
  setHeight: (height: number) => void;
};

const TabBarVisibilityContext = createContext<TabBarVisibilityContextValue>({
  hidden: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHidden: () => {},
  height: 72,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setHeight: () => {},
});

export function TabBarVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const [height, setHeight] = useState(72);

  const value = useMemo(
    () => ({
      hidden,
      setHidden,
      height,
      setHeight,
    }),
    [hidden, height]
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

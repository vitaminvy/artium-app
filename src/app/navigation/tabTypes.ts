export type TabParamList = {
  Home: undefined;
  Feed: undefined;
  EmptyQuickSell: undefined;
  QuickSell: undefined;
  Discover: undefined;
  Upload: undefined;
};

export type TabRouteName = keyof TabParamList;

export const TAB_LABELS: Record<TabRouteName, string> = {
  Home: "Home",
  Feed: "My Feed",
  EmptyQuickSell: " ",
  QuickSell: "Quick Sell",
  Discover: "Discover",
  Upload: "Upload",
};

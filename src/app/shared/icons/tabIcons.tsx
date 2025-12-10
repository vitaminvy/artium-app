import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TabRouteName } from "../../navigation/tabTypes";

type TabIconConfig = {
  active: React.ReactNode;
  inactive: React.ReactNode;
};

const baseInactive = "#777777";
const baseActive = "#111827";

export const TabIcons: Record<TabRouteName, TabIconConfig> = {
  Home: {
    active: <Ionicons name="home" size={26} color={baseActive} />,
    inactive: <Ionicons name="home-outline" size={26} color={baseInactive} />,
  },
  Feed: {
    active: <Ionicons name="globe" size={26} color={baseActive} />,
    inactive: <Ionicons name="globe-outline" size={26} color={baseInactive} />,
  },
  QuickSell: {
    active: <Ionicons name="cash-outline" size={26} color="#FFFFFF" />,
    inactive: <Ionicons name="cash-outline" size={26} color="#347CFF" />,
  },
  Discover: {
    active: <Ionicons name="search" size={26} color={baseActive} />,
    inactive: <Ionicons name="search-outline" size={26} color={baseInactive} />,
  },
  Upload: {
    active: <Ionicons name="add" size={28} color={baseActive} />,
    inactive: <Ionicons name="add-outline" size={28} color={baseInactive} />,
  },
};

export type { TabIconConfig };

import { Ionicons } from "@expo/vector-icons";

export type SidebarKey =
  | "home"
  | "profile"
  | "messages"
  | "portfolio"
  | "customWebsite"
  | "events"
  | "inventory"
  | "sales"
  | "invoices"
  | "salesRecord"
  | "testimonials"
  | "contact"
  | "marketing";

export type SidebarItem = {
  key: SidebarKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
  trailing?: "external" | "expand";
  children?: SidebarChild[];
};

export type SidebarChild = {
  key: SidebarKey;
  label: string;
  subtitle?: string;
  trailing?: "external";
};

const ITEMS: SidebarItem[] = [
  { key: "home", label: "Home", icon: "home-outline" },
  { key: "profile", label: "Profile", icon: "person-circle-outline" },
  {
    key: "inventory",
    label: "Inventory",
    icon: "image-outline",
    subtitle: "Manage artworks and artists",
  },
  {
    key: "events",
    label: "Events",
    icon: "calendar-outline",
    subtitle: "Manage your events",
  },
  {
    key: "invoices",
    label: "Invoices",
    icon: "document-text-outline",
    subtitle: "Create and send invoices",
  },
  {
    key: "messages",
    label: "Messages",
    icon: "chatbox-ellipses-outline",
    subtitle: "Leaving the app and redirecting to the web version",
    trailing: "external",
  },
  // {
  //   key: "portfolio",
  //   label: "Portfolio",
  //   icon: "briefcase-outline",
  //   subtitle: "Leaving the app and redirecting to the web version",
  //   trailing: "external",
  // },
  // {
  //   key: "customWebsite",
  //   label: "Custom Website",
  //   icon: "globe-outline",
  //   subtitle: "Leaving the app and redirecting to the web version",
  //   trailing: "external",
  // },
  // {
  //   key: "sales",
  //   label: "Sales",
  //   icon: "pricetag-outline",
  //   trailing: "expand",
  //   children: [
  //     { key: "invoices", label: "Invoices" },
  //     {
  //       key: "salesRecord",
  //       label: "Sales Record",
  //       subtitle: "Leaving the app and redirecting to the web version",
  //       trailing: "external",
  //     },
  //     {
  //       key: "testimonials",
  //       label: "Testimonials",
  //       subtitle: "Leaving the app and redirecting to the web version",
  //       trailing: "external",
  //     },
  //   ],
  // },
  // {
  //   key: "contact",
  //   label: "Contact Management",
  //   icon: "people-outline",
  //   subtitle: "Leaving the app and redirecting to the web version",
  //   trailing: "external",
  // },
  // {
  //   key: "marketing",
  //   label: "Marketing Email",
  //   icon: "mail-outline",
  //   subtitle: "Leaving the app and redirecting to the web version",
  //   trailing: "external",
  // },
];

export type SidebarActionKey = SidebarKey | "logout";

export function useSidebarItems() {
  return ITEMS;
}

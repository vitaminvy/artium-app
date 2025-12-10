import { useCallback, useState } from "react";

export type SidebarItem = "home" | "profile" | "sale";

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleSelect = useCallback(
    (item: SidebarItem, onSelect?: (item: SidebarItem) => void) => {
      onSelect?.(item);
      setIsOpen(false);
    },
    []
  );

  return { isOpen, open, close, toggle, handleSelect };
}

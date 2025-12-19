import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { SidebarKey } from "../../../shared/hooks/useSidebar";
import {
  Artist,
  Artwork,
  Folder,
  InventoryStatus,
  ViewMode,
} from "../types";
import {
  INITIAL_ARTISTS,
  INITIAL_ARTWORKS,
  INITIAL_FOLDERS,
} from "../mockData";

export function useInventoryList() {
  const navigation = useNavigation<any>();
  const [activeKey, setActiveKey] = useState<SidebarKey>("inventory"); // sidebar key
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"artworks" | "artists">("artworks");
  
  // Data State
  const [artworks, setArtworks] = useState<Artwork[]>(INITIAL_ARTWORKS);
  const [artists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  
  // Folder Picker State
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const nextFolderIndex = useRef(1);

  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  // --- Filtering Logic ---
  const filteredArtworks = useMemo(() => {
    const term = query.trim().toLowerCase();
    const byFolder = activeFolder
      ? artworks.filter((item) => item.folder === activeFolder)
      : artworks;
    if (!term) return byFolder;
    return byFolder.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.artist.toLowerCase().includes(term)
    );
  }, [artworks, query, activeFolder]);

  const filteredArtists = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return artists;
    return artists.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.origin.toLowerCase().includes(term)
    );
  }, [artists, query]);

  // --- Effects ---
  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(() => setFlashMessage(null), 2600);
    return () => clearTimeout(t);
  }, [flashMessage]);

  // --- Actions ---
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openDetail = (id: string) => {
    navigation.navigate("ArtworkDetail" as never, { id } as never);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkUpdateStatus = (status: InventoryStatus) => {
    setArtworks((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status } : item
      )
    );
    setFlashMessage(`Updated ${selectedCount} item(s) to ${status}`);
    clearSelection();
  };

  const bulkMoveToFolder = (folder: string) => {
    setArtworks((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, folder } : item
      )
    );
    setFlashMessage(`Moved ${selectedCount} item(s) to ${folder}`);
    clearSelection();
  };

  const bulkRemove = () => {
    setArtworks((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setFlashMessage(`Removed ${selectedCount} item(s)`);
    clearSelection();
  };

  // --- Folder Management ---
  const handleConfirmCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    
    const suffix = nextFolderIndex.current++;
    const palette = ["#E0F2FE", "#F7FEE7", "#FFECE5", "#F3E8FF"];
    const tone = palette[folders.length % palette.length];
    const newFolder: Folder = {
      id: `fd-${Date.now()}-${suffix}`,
      name,
      count: 0,
      tone,
    };
    
    setFolders((prev) => [...prev, newFolder]);
    setFlashMessage(`Created "${name}"`);
    setActiveFolder(name);
    setNewFolderName("");
    setCreatingFolder(false);
  };

  const getFolderCount = (folderName: string) =>
    artworks.filter((item) => item.folder === folderName).length;

  return {
    navigation,
    activeKey,
    sidebarOpen,
    setSidebarOpen,
    tab,
    setTab,
    viewMode,
    setViewMode,
    query,
    setQuery,
    flashMessage,
    
    // Data
    artworks: filteredArtworks,
    artists: filteredArtists,
    folders,
    
    // Selection
    selectedIds,
    hasSelection,
    selectedCount,
    toggleSelect,
    clearSelection,
    
    // Bulk Actions
    bulkUpdateStatus,
    bulkMoveToFolder,
    bulkRemove,
    openDetail,
    
    // Folder Picker
    showFolderPicker,
    setShowFolderPicker,
    activeFolder,
    setActiveFolder,
    creatingFolder,
    setCreatingFolder,
    newFolderName,
    setNewFolderName,
    handleConfirmCreateFolder,
    getFolderCount,
  };
}

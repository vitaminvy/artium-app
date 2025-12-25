import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
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
  INITIAL_FOLDERS,
} from "../mockData";

export function useInventoryList() {
  const navigation = useNavigation<any>();
  const { currentUser } = useAuth();
  const [activeKey, setActiveKey] = useState<SidebarKey>("inventory");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<"artworks" | "artists">("artworks");
  
  // Data State
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [artists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [queryText, setQueryText] = useState("");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  
  // Folder Picker State
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const nextFolderIndex = useRef(1);
  const DEFAULT_UPLOAD_FOLDER = "Unsorted";

  // --- Real-time Data Fetching ---
  useEffect(() => {
    if (!currentUser) {
      setArtworks([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestore, "artworks"),
      where("authorId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedArtworks: Artwork[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Map Firestore data to Inventory Artwork type
        // Assuming data structure matches what's saved in uploadService
        const dim = data.dimension || {};
        const dimensionStr = `${dim.h || 0} × ${dim.w || 0} × ${dim.d || 0} ${dim.unit || 'in'}`;
        
        let status: InventoryStatus = "Available";
        if (data.status === "sold") status = "Sold";
        if (data.status === "inquire") status = "On Hold";

        const rawPrice = data.price;
        const priceLabel = rawPrice
          ? typeof rawPrice === "number"
            ? `$${rawPrice}`
            : rawPrice.includes("$")
              ? rawPrice
              : `$${rawPrice}`
          : "Price on Request";

        return {
          id: doc.id,
          title: data.title || "Untitled",
          artist: data.artist?.name || data.authorName || "Unknown Artist",
          year: parseInt(data.year) || new Date().getFullYear(),
          price: priceLabel,
          status: status,
          folder: data.folder || "Unsorted",
          thumbnail: data.images?.[0] || "",
          dimensions: dimensionStr,
          images: data.images || [],
          tags: data.tags || [],
          details: {
            title: data.title,
            description: data.description,
            year: data.year,
            edition: data.edition,
            materials: data.medium || data.materials,
            price: data.price,
            quantity: "1",
            dimensions: {
              unit: dim.unit || "in",
              height: dim.h,
              width: dim.w,
              depth: dim.d
            },
            weight: {
              unit: "lbs",
              value: data.weight || "0"
            },
            status: data.status,
            hasFrame: false
          }
        };
      });
      
      setArtworks(fetchedArtworks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  // --- Filtering Logic ---
  const filteredArtworks = useMemo(() => {
    const term = queryText.trim().toLowerCase();
    const byFolder = activeFolder
      ? artworks.filter((item) => item.folder === activeFolder)
      : artworks;
    if (!term) return byFolder;
    return byFolder.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        item.artist.toLowerCase().includes(term)
    );
  }, [artworks, queryText, activeFolder]);

  const filteredArtists = useMemo(() => {
    const term = queryText.trim().toLowerCase();
    if (!term) return artists;
    return artists.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.origin.toLowerCase().includes(term)
    );
  }, [artists, queryText]);

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

  const openDetail = (artwork: Artwork) => {
    // Navigate to ArtworkDetail with the ID. 
    // The screen will fetch fresh data, or you can pass 'artwork' param if you want instant load (but partial data if mapped differently).
    navigation.navigate("ArtworkDetail" as never, { id: artwork.id } as never);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkUpdateStatus = (status: InventoryStatus) => {
    // TODO: Implement Firestore update for bulk status
    setArtworks((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, status } : item
      )
    );
    setFlashMessage(`Updated ${selectedCount} item(s) to ${status}`);
    clearSelection();
  };

  const bulkMoveToFolder = (folder: string) => {
    // TODO: Implement Firestore update for bulk folder
    setArtworks((prev) =>
      prev.map((item) =>
        selectedIds.includes(item.id) ? { ...item, folder } : item
      )
    );
    setFlashMessage(`Moved ${selectedCount} item(s) to ${folder}`);
    clearSelection();
  };

  const moveSingleToFolder = (id: string, folder: string) => {
    ensureFolderExists(folder);
    // TODO: Implement Firestore update
    setArtworks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, folder } : item))
    );
    setFlashMessage(`Moved to ${folder}`);
  };

  const bulkRemove = () => {
    // TODO: Implement Firestore delete
    setArtworks((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setFlashMessage(`Removed ${selectedCount} item(s)`);
    clearSelection();
  };

  // --- Folder Management ---
  const handleConfirmCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return null;
    
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
    return name;
  };

  const ensureFolderExists = (folderName: string) => {
    setFolders((prev) => {
      const exists = prev.some((f) => f.name === folderName);
      if (exists) return prev;
      const suffix = nextFolderIndex.current++;
      const tone = "#F8FAFC";
      return [
        ...prev,
        { id: `fd-${Date.now()}-${suffix}`, name: folderName, count: 0, tone },
      ];
    });
  };

  const addArtwork = (newArtwork: Artwork) => {
    // This is now mainly handled by real-time listener, 
    // but can keep for optimistic UI if needed (though tricky with ID).
    // For now, let the listener handle it.
  };

  const getFolderCount = (folderName: string) =>
    artworks.filter((item) => item.folder === folderName).length;

  return {
    navigation,
    activeKey,
    setActiveKey,
    sidebarOpen,
    setSidebarOpen,
    tab,
    setTab,
    viewMode,
    setViewMode,
    query: queryText,
    setQuery: setQueryText,
    flashMessage,
    
    // Data
    artworks: filteredArtworks,
    artists: filteredArtists,
    folders,
    loading,
    
    // Selection
    selectedIds,
    hasSelection,
    selectedCount,
    toggleSelect,
    clearSelection,
    
    // Bulk Actions
    bulkUpdateStatus,
    bulkMoveToFolder,
    moveSingleToFolder,
    bulkRemove,
    openDetail,
    addArtwork,
    setFlashMessage,

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

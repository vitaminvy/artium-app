import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import { useNavigation } from "@react-navigation/native";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import Sidebar from "../shared/components/Sidebar";
import { useSidebarItems } from "../shared/hooks/useSidebar";

type InventoryStatus = "Available" | "On Hold" | "Sold";

type Artwork = {
  id: string;
  title: string;
  artist: string;
  year: number;
  price: string;
  status: InventoryStatus;
  folder: string;
  thumbnail: string;
  dimensions: string;
};

type Artist = {
  id: string;
  name: string;
  origin: string;
  artworks: number;
  represented: boolean;
  avatar: string;
};

type Folder = { id: string; name: string; count: number; tone: string };

const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: "aw-1",
    title: "Midnight Bloom",
    artist: "Harper Liu",
    year: 2023,
    price: "$3,800",
    status: "Available",
    folder: "New Arrivals",
    dimensions: "24 x 36 in",
    thumbnail:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-2",
    title: "Lines of Silence",
    artist: "Jonas K.",
    year: 2021,
    price: "$2,600",
    status: "On Hold",
    folder: "Minimal",
    dimensions: "30 x 30 in",
    thumbnail:
      "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-3",
    title: "Field Notes",
    artist: "Amira Patel",
    year: 2022,
    price: "$4,500",
    status: "Sold",
    folder: "Archive",
    dimensions: "40 x 52 in",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-4",
    title: "Tide Pool Study",
    artist: "Elliot Marsh",
    year: 2020,
    price: "$1,950",
    status: "Available",
    folder: "Study Series",
    dimensions: "18 x 24 in",
    thumbnail:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-5",
    title: "Aurora Fragment",
    artist: "Linh Tran",
    year: 2023,
    price: "$6,200",
    status: "Available",
    folder: "New Arrivals",
    dimensions: "32 x 48 in",
    thumbnail:
      "https://images.unsplash.com/photo-1523419400524-1d9233d82db0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "aw-6",
    title: "Soft Geometry",
    artist: "Mara Silas",
    year: 2019,
    price: "$2,100",
    status: "On Hold",
    folder: "Minimal",
    dimensions: "22 x 30 in",
    thumbnail:
      "https://images.unsplash.com/photo-1496482475496-a91f31e0386a?auto=format&fit=crop&w=800&q=80",
  },
];

const INITIAL_ARTISTS: Artist[] = [
  {
    id: "ar-1",
    name: "Harper Liu",
    origin: "Los Angeles, USA",
    artworks: 18,
    represented: true,
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-2",
    name: "Linh Tran",
    origin: "Da Nang, Vietnam",
    artworks: 25,
    represented: false,
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-3",
    name: "Elliot Marsh",
    origin: "Copenhagen, Denmark",
    artworks: 14,
    represented: true,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "ar-4",
    name: "Mara Silas",
    origin: "Toronto, Canada",
    artworks: 9,
    represented: false,
    avatar:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=400&q=80",
  },
];

const INITIAL_FOLDERS: Folder[] = [
  { id: "fd-1", name: "New Arrivals", count: 8, tone: "#F8FAFC" },
  { id: "fd-2", name: "Minimal", count: 6, tone: "#F8FAFC" },
  { id: "fd-3", name: "Study Series", count: 3, tone: "#F8FAFC" },
  { id: "fd-4", name: "Archive", count: 11, tone: "#F8FAFC" },
];

const VIEW_MODES = [
  { key: "grid", icon: "grid-outline", label: "Grid" },
  { key: "list", icon: "list-outline", label: "List" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["key"];

export default function InventoryScreen() {
  const navigation = useNavigation<any>();
  const { height: tabBarHeight } = useTabBarVisibility();
  const items = useSidebarItems();
  const activeKey = "inventory";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [tab, setTab] = useState<"artworks" | "artists">("artworks");
  const [artworks, setArtworks] = useState<Artwork[]>(INITIAL_ARTWORKS);
  const [artists] = useState<Artist[]>(INITIAL_ARTISTS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const nextFolderIndex = useRef(1);
  const screenPadding = 20;
  const cardWidth =
    (Dimensions.get("window").width - screenPadding * 2 - 14) / 2;
  const rootNav = navigation.getParent?.()?.getParent?.() ?? navigation;
  const openUpload = () => {
    rootNav.navigate("Upload");
  };

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

  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  useEffect(() => {
    if (!flashMessage) return;
    const t = setTimeout(() => setFlashMessage(null), 2600);
    return () => clearTimeout(t);
  }, [flashMessage]);

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

  const openFolderPicker = () => {
    setShowFolderPicker(true);
  };

  const handleCreateFolder = () => {
    setCreatingFolder(true);
  };

  const handleConfirmCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      return;
    }
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

  const handleCancelCreateFolder = () => {
    setCreatingFolder(false);
    setNewFolderName("");
  };

  const getFolderCount = (folderName: string) =>
    artworks.filter((item) => item.folder === folderName).length;

  const renderStatusBadge = (status: InventoryStatus) => {
    const config: Record<InventoryStatus, { bg: string; text: string }> = {
      Available: { bg: "#DCFCE7", text: "#15803D" },
      "On Hold": { bg: "#FEF3C7", text: "#B45309" },
      Sold: { bg: "#FEE2E2", text: "#B91C1C" },
    };
    const { bg, text } = config[status];
    return (
      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: bg }}>
        <Text className="text-xs font-semibold" style={{ color: text }}>
          {status}
        </Text>
      </View>
    );
  };

  const renderArtworkCard = (item: Artwork, variant: ViewMode) => {
    const isSelected = selectedIds.includes(item.id);
    const onPressCard = () => {
      if (hasSelection) {
        toggleSelect(item.id);
      } else {
        openDetail(item.id);
      }
    };

    const onLongPressCard = () => toggleSelect(item.id);

    if (variant === "list") {
      return (
        <Pressable
          key={item.id}
          onPress={onPressCard}
          onLongPress={onLongPressCard}
          className={`flex-row gap-3 rounded-2xl border bg-white p-3 ${isSelected ? "border-[#0B73FF] shadow-sm" : "border-slate-200"
            }`}
        >
          <View className="h-24 w-24 rounded-xl overflow-hidden bg-slate-100">
            <Image
              source={{ uri: item.thumbnail }}
              resizeMode="cover"
              style={{ height: "100%", width: "100%" }}
            />
            {isSelected ? (
              <View className="absolute inset-0 bg-[#0B73FF]/10 items-center justify-center">
                <Ionicons name="checkmark-circle" size={26} color="#0B73FF" />
              </View>
            ) : null}
          </View>

          <View className="flex-1 justify-center">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <Text className="text-base font-semibold text-slate-900">
                  {item.title}
                </Text>
                <Text className="text-sm text-slate-500 mt-0.5">
                  {item.artist} • {item.year}
                </Text>
              </View>
              {renderStatusBadge(item.status)}
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-slate-500">{item.dimensions}</Text>
                <Text className="text-lg font-bold text-slate-900">
                  {item.price}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs font-semibold text-slate-500">
                  Folder
                </Text>
                <Text className="text-sm font-semibold text-slate-800">
                  {item.folder}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    }

    return (
      <Pressable
        key={item.id}
        onPress={onPressCard}
        onLongPress={onLongPressCard}
        className={`rounded-2xl border bg-white p-3 ${isSelected ? "border-[#0B73FF] shadow-sm" : "border-slate-200"
          }`}
        style={{ width: cardWidth }}
      >
        <View className="rounded-xl overflow-hidden bg-slate-100 h-36 mb-3">
          <Image
            source={{ uri: item.thumbnail }}
            resizeMode="cover"
            style={{ height: "100%", width: "100%" }}
          />
          {isSelected ? (
            <View className="absolute inset-0 bg-[#0B73FF]/15 items-center justify-center">
              <Ionicons name="checkmark-circle" size={26} color="#0B73FF" />
            </View>
          ) : null}
        </View>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-[15px] font-semibold text-slate-900">
              {item.title}
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {item.artist} • {item.year}
            </Text>
          </View>
          {renderStatusBadge(item.status)}
        </View>
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-base font-bold text-slate-900">
            {item.price}
          </Text>
          <Text className="text-xs font-semibold text-slate-600">
            {item.folder}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderArtistCard = (item: Artist) => {
    return (
      <View
        key={item.id}
        className="flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-3"
      >
        <View className="h-14 w-14 rounded-full overflow-hidden bg-slate-100">
          <Image
            source={{ uri: item.avatar }}
            resizeMode="cover"
            style={{ height: "100%", width: "100%" }}
          />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-semibold text-slate-900">
                {item.name}
              </Text>
              <Text className="text-sm text-slate-500">{item.origin}</Text>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${item.represented ? "bg-[#DCFCE7]" : "bg-slate-100"
                }`}
            >
              <Text
                className={`text-xs font-semibold ${item.represented ? "text-emerald-700" : "text-slate-500"
                  }`}
              >
                {item.represented ? "Represented" : "Independent"}
              </Text>
            </View>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-slate-500">
              {item.artworks} artworks in inventory
            </Text>
            <Pressable className="flex-row items-center gap-1">
              <Text className="text-sm font-semibold text-[#0B73FF]">
                View profile
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#0B73FF" />
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const renderBulkActions = () => {
    if (!hasSelection) return null;
    return (
      <View className="rounded-2xl border border-slate-200 bg-white px-4 py-3 mb-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm font-semibold text-slate-900">
            {selectedCount} selected
          </Text>
          <Pressable onPress={clearSelection} className="px-2 py-1">
            <Text className="text-sm font-medium text-[#0B73FF]">Clear</Text>
          </Pressable>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <ActionChip
            icon="folder-open-outline"
            label="Move to folder"
            onPress={() => bulkMoveToFolder("Archive")}
          />
          <ActionChip
            icon="checkmark-done-outline"
            label="Mark as sold"
            onPress={() => bulkUpdateStatus("Sold")}
          />
          <ActionChip
            icon="time-outline"
            label="Put on hold"
            onPress={() => bulkUpdateStatus("On Hold")}
          />
          <ActionChip
            icon="trash-outline"
            label="Remove"
            onPress={bulkRemove}
            tone="destructive"
          />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Inventory"
        showBadge={false}
        actionType="menu"
        isMenuOpen={sidebarOpen}
        onPressAction={() => setSidebarOpen((prev) => !prev)}
        onHeightChange={setHeaderHeight}
        underlineSource={UnderlineHome}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 32 + tabBarHeight,
          paddingHorizontal: screenPadding,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable
            onPress={openFolderPicker}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-80"
          >
            <Ionicons name="folder-outline" size={18} color="#0F172A" />
            <Text className="text-sm font-semibold text-slate-800">
              Folder
            </Text>
          </Pressable>

          <View className="flex-1">
            <Pressable
              onPress={openUpload}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-[#0B73FF] px-4 py-3 shadow-[0px_12px_30px_rgba(11,115,255,0.18)] active:opacity-90"
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">
                Upload Artwork
              </Text>
            </Pressable>
          </View>
        </View>

        {flashMessage ? (
          <View className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle-outline" size={18} color="#0B73FF" />
              <Text className="text-sm font-semibold text-slate-800">
                {flashMessage}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Folder quick actions removed per request */}

        <View className="mt-6 rounded-3xl border border-slate-200 bg-white p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-2">
              {["artworks", "artists"].map((key) => {
                const isActive = tab === key;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      setTab(key as any);
                      if (key === "artists") clearSelection();
                    }}
                    className={`rounded-full px-4 py-2 ${isActive ? "bg-[#0B73FF]" : "bg-slate-100"
                      }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${isActive ? "text-white" : "text-slate-600"
                        }`}
                    >
                      {key === "artworks" ? "Artworks" : "Artists"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center rounded-full border border-slate-200 bg-slate-50 px-3">
              <Ionicons name="search-outline" size={16} color="#0F172A" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name"
                placeholderTextColor="#94A3B8"
                className="ml-2 h-10 flex-1 text-[13px] text-slate-900"
                returnKeyType="search"
              />
            </View>

            <View className="flex-row items-center rounded-full border border-slate-200 bg-slate-50">
              {VIEW_MODES.map((mode) => {
                const isActive = viewMode === mode.key;
                return (
                  <Pressable
                    key={mode.key}
                    onPress={() => setViewMode(mode.key)}
                    className={`flex-row items-center gap-1 px-3 py-2 rounded-full ${isActive ? "bg-white border border-slate-200" : ""
                      }`}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={16}
                      color={isActive ? "#0B73FF" : "#475569"}
                    />
                    <Text
                      className={`text-[12px] font-semibold ${isActive ? "text-[#0B73FF]" : "text-slate-600"
                        }`}
                    >
                      {mode.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {tab === "artworks" ? renderBulkActions() : null}

        <View className="mt-3">
          {tab === "artworks" ? (
            filteredArtworks.length ? (
              viewMode === "list" ? (
                <View className="gap-3">
                  {filteredArtworks.map((item) =>
                    renderArtworkCard(item, "list")
                  )}
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-3">
                  {filteredArtworks.map((item) =>
                    renderArtworkCard(item, "grid")
                  )}
                </View>
              )
            ) : (
              <EmptyState />
            )
          ) : filteredArtists.length ? (
            <View className="gap-3">
              {filteredArtists.map((item) => renderArtistCard(item))}
            </View>
          ) : (
            <EmptyState />
          )}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(key) => {
          setSidebarOpen(false);
          if (key === "inventory") return;
          console.log("Selected sidebar item:", key);
        }}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={items}
      />

      <Modal
        visible={showFolderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFolderPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/25"
          onPress={() => setShowFolderPicker(false)}
        />
        <View
          className="absolute left-4 right-4 rounded-3xl bg-white p-6 shadow-lg"
          style={{ top: "24%", maxHeight: "70%" }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-semibold text-slate-900">
              Choose folder
            </Text>
            <Pressable onPress={() => setShowFolderPicker(false)}>
              <Ionicons name="close" size={22} color="#0F172A" />
            </Pressable>
          </View>
          <ScrollView className="mt-2" contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
            {folders.map((folder) => {
              const count = getFolderCount(folder.name);
              const selected = activeFolder === folder.name;
              return (
                <Pressable
                  key={folder.id}
                  onPress={() => {
                    setActiveFolder(folder.name);
                    setShowFolderPicker(false);
                  }}
                  className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${selected ? "border-[#0B73FF] bg-[#E0F2FE]" : "border-slate-200 bg-white"
                    }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="h-10 w-10 rounded-full items-center justify-center bg-slate-50">
                      <Ionicons name="folder-outline" size={18} color="#0F172A" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {folder.name}
                      </Text>
                      <Text className="text-xs text-slate-500">{count} item(s)</Text>
                    </View>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={20} color="#0B73FF" />
                  ) : null}
                </Pressable>
              );
            })}
            {creatingFolder ? (
              <View className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Text className="text-sm font-semibold text-slate-900 mb-2">
                  Name your folder
                </Text>
                <View className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <TextInput
                    value={newFolderName}
                    onChangeText={setNewFolderName}
                    placeholder="Your Collection's Name"
                    placeholderTextColor="#94A3B8"
                    className="text-slate-900"
                    style={{ paddingVertical: 0, textAlignVertical: "center" }}
                    autoFocus
                  />
                </View>
                <View className="mt-3 flex-row items-center gap-2">
                  <Pressable
                    onPress={handleCancelCreateFolder}
                    className="flex-1 rounded-full border border-slate-200 py-2 items-center"
                  >
                    <Text className="text-sm font-semibold text-slate-700">
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleConfirmCreateFolder}
                    className="flex-1 rounded-full bg-[#0B73FF] py-2 items-center active:opacity-90"
                  >
                    <Text className="text-sm font-semibold text-white">
                      Create
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handleCreateFolder}
                className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <Ionicons name="add-circle-outline" size={18} color="#0F172A" />
                <Text className="text-sm font-semibold text-slate-800">
                  Create new folder
                </Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ActionChip({
  icon,
  label,
  onPress,
  tone = "default",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: "default" | "destructive";
}) {
  const bg = tone === "destructive" ? "bg-rose-50" : "bg-slate-100";
  const text = tone === "destructive" ? "text-rose-600" : "text-slate-700";
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-full px-3 py-2 ${bg}`}
    >
      <Ionicons
        name={icon}
        size={16}
        color={tone === "destructive" ? "#E11D48" : "#0F172A"}
      />
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View className="items-center justify-center py-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50 mt-4">
      <View className="h-12 w-12 rounded-full bg-white items-center justify-center border border-slate-200">
        <Ionicons name="images-outline" size={22} color="#0B73FF" />
      </View>
      <Text className="mt-3 text-base font-semibold text-slate-900">
        No results found
      </Text>
      <Text className="mt-1 text-sm text-slate-500 px-10 text-center">
        Try adjusting your search or start uploading new artworks.
      </Text>
    </View>
  );
}

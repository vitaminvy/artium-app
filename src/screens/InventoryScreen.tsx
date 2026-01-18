import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import Sidebar from "../shared/components/Sidebar";
import {
  SidebarActionKey,
  useSidebarItems,
} from "../shared/hooks/useSidebar";

import { useInventoryList } from "../domains/inventory/hooks/useInventoryList";
import { VIEW_MODES } from "../domains/inventory/types";
import { InventoryItemCard } from "../domains/inventory/components/list/InventoryItemCard";
import { ArtistCard } from "../domains/inventory/components/list/ArtistCard";
import { BulkActions } from "../domains/inventory/components/list/BulkActions";
import { InventoryEmptyState } from "../domains/inventory/components/list/InventoryEmptyState";
import { FolderPickerModal } from "../domains/inventory/components/list/FolderPickerModal";
import { Artwork } from "../domains/inventory/types";
import { useLogout } from "../domains/auth/hooks/useLogout";
import { LogoutConfirmModal } from "../domains/auth/components/LogoutConfirmModal";

export default function InventoryScreen() {
  const { height: tabBarHeight, setHidden } = useTabBarVisibility();
  const items = useSidebarItems();
  const {
    logout,
    loading: logoutLoading,
    showConfirmModal,
    onConfirmLogout,
    onCancelLogout,
  } = useLogout();
  const [headerHeight, setHeaderHeight] = useState(96);
  const route = useRoute<any>();
  const lastOffset = useRef(0);
  const toastY = useRef(new Animated.Value(-120)).current;
  const [artworkImagesExpected, setArtworkImagesExpected] = useState(0);
  const [artworkImagesLoaded, setArtworkImagesLoaded] = useState(0);
  const loadedArtworkIds = useRef<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    navigation,
    activeKey,
    setActiveKey,
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
    artworks,
    artists,
    folders,
    loading,
    refreshInventory,

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
    addArtwork,
    moveSingleToFolder,
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
  } = useInventoryList();

  const screenPadding = 20;
  const gridCardWidth = (Dimensions.get("window").width - screenPadding * 2 - 12) / 2;
  const [pickerMode, setPickerMode] = useState<"filter" | "move">("filter");
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);
  const rootNav = navigation.getParent?.()?.getParent?.() ?? navigation;
  const openUpload = () => {
    rootNav.navigate("Upload");
  };
  const artworkImagesReady =
    artworkImagesExpected === 0 || artworkImagesLoaded >= artworkImagesExpected;

  useFocusEffect(
    useCallback(() => {
      setActiveKey("inventory");
    }, [setActiveKey])
  );

  useEffect(() => {
    const incoming: Artwork | undefined = route.params?.newArtwork;
    if (incoming) {
      addArtwork(incoming);
      navigation.setParams?.({ newArtwork: undefined });
    }
  }, [route.params?.newArtwork, addArtwork, navigation]);

  useEffect(() => {
    if (tab !== "artworks" || loading) {
      loadedArtworkIds.current = new Set();
      setArtworkImagesExpected(0);
      setArtworkImagesLoaded(0);
      return;
    }

    const expectedIds = new Set(
      artworks.filter((item) => item.thumbnail).map((item) => item.id)
    );
    const retained = new Set(
      [...loadedArtworkIds.current].filter((id) => expectedIds.has(id))
    );

    loadedArtworkIds.current = retained;
    setArtworkImagesExpected(expectedIds.size);
    setArtworkImagesLoaded(retained.size);
  }, [tab, loading, artworks]);

  const handleArtworkImageLoad = useCallback(
    (id: string) => {
      if (!artworkImagesExpected) return;
      if (loadedArtworkIds.current.has(id)) return;
      loadedArtworkIds.current.add(id);
      setArtworkImagesLoaded((prev) =>
        Math.min(prev + 1, artworkImagesExpected)
      );
    },
    [artworkImagesExpected]
  );

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshInventory();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshInventory]);

  useEffect(
    () => () => {
      setHidden(false);
    },
    [setHidden]
  );

  useEffect(() => {
    if (!flashMessage) return;
    toastY.setValue(-120);
    Animated.sequence([
      Animated.timing(toastY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(toastY, {
        toValue: -120,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setFlashMessage(null));
  }, [flashMessage, setFlashMessage, toastY]);

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

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: screenPadding,
          right: screenPadding,
          top: Math.max(headerHeight - 6, 24),
          transform: [{ translateY: toastY }],
          zIndex: 30,
          elevation: 8,
        }}
      >
        {flashMessage ? (
          <View className="rounded-2xl border border-[#0B73FF] bg-white px-4 py-3 shadow-lg shadow-[#0B73FF]/30">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 rounded-full bg-[#E0F2FE] items-center justify-center">
                <Ionicons name="checkmark-done" size={18} color="#0B73FF" />
              </View>
              <Text className="text-sm font-semibold text-slate-900 flex-1">
                {flashMessage}
              </Text>
            </View>
          </View>
        ) : null}
      </Animated.View>
        {/* cta btn */}
      <View className="flex-row items-center gap-3 mt-4" style={{ paddingHorizontal: screenPadding }}>
        <Pressable
          onPress={() => {
            setPickerMode("filter");
            setMoveTargetId(null);
            setShowFolderPicker(true);
          }}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 active:opacity-80"
        >
          <Ionicons name="folder-outline" size={18} color="#0F172A" />
          <Text className="text-sm font-semibold text-slate-800">Folder</Text>
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

        {/* Search and View Mode Controls */}
        <View
          className="mt-6 rounded-3xl border border-slate-200 bg-white p-4"
          style={{ marginHorizontal: screenPadding }}
        >
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

        <View className="mt-3 flex-row items-center gap-2" >
          <View className="flex-1 flex-row items-center rounded-full border border-slate-200 bg-slate-50 px-3">
            <Ionicons name="search-outline" size={16} color="#0F172A" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name"
              placeholderTextColor="#94A3B8"
              className="ml-2 h-10 flex-1 text-[13px] text-slate-900"
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
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
      
      {/* Artwork List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 32 + tabBarHeight,
          paddingHorizontal: screenPadding,
        }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const diff = y - lastOffset.current;
          if ((diff > 6 && y > 24) || y > 120) {
            setHidden(true);
          } else if (diff < -6) {
            setHidden(false);
          }
          lastOffset.current = y;
        }}
      >
        {tab === "artworks" ? (
          <BulkActions
            selectedCount={selectedCount}
            onClear={clearSelection}
            onMoveToFolder={bulkMoveToFolder}
            onUpdateStatus={bulkUpdateStatus}
            onRemove={bulkRemove}
          />
        ) : null}

        <View className="mt-3" style={{ position: "relative" }}>
          {tab === "artworks" ? (
            artworks.length ? (
              viewMode === "list" ? (
                <View className="gap-3">
                  {artworks.map((item) => (
                    <InventoryItemCard
                      key={item.id}
                      item={item}
                      variant="list"
                      isSelected={selectedIds.includes(item.id)}
                      onPress={() => {
                        if (hasSelection) toggleSelect(item.id);
                        else openDetail(item);
                      }}
                      onLongPress={() => {
                        setPickerMode("move");
                        setMoveTargetId(item.id);
                        setShowFolderPicker(true);
                      }}
                      onImageLoad={
                        item.thumbnail
                          ? () => handleArtworkImageLoad(item.id)
                          : undefined
                      }
                    />
                  ))}
                </View>
              ) : (
                <View className="flex-row flex-wrap gap-3">
                  {artworks.map((item) => (
                    <InventoryItemCard
                      key={item.id}
                      item={item}
                      variant="grid"
                      isSelected={selectedIds.includes(item.id)}
                      onPress={() => {
                        if (hasSelection) toggleSelect(item.id);
                        else openDetail(item);
                      }}
                      onLongPress={() => {
                        setPickerMode("move");
                        setMoveTargetId(item.id);
                        setShowFolderPicker(true);
                      }}
                      onImageLoad={
                        item.thumbnail
                          ? () => handleArtworkImageLoad(item.id)
                          : undefined
                      }
                    />
                  ))}
                </View>
              )
            ) : (
              <InventoryEmptyState />
            )
          ) : artists.length ? (
            viewMode === "list" ? (
              <View className="gap-3">
                {artists.map((item) => (
                  <ArtistCard key={item.id} item={item} variant="list" />
                ))}
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {artists.map((item) => (
                  <ArtistCard
                    key={item.id}
                    item={item}
                    variant="grid"
                    width={gridCardWidth}
                  />
                ))}
              </View>
            )
          ) : (
            <InventoryEmptyState />
          )}

          {tab === "artworks" && (loading || !artworkImagesReady) ? (
            <View
              className="absolute left-0 right-0 top-0 bottom-0 bg-white"
              pointerEvents="none"
            >
              <InventorySkeleton
                tab={tab}
                viewMode={viewMode}
                gridCardWidth={gridCardWidth}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(key: SidebarActionKey) => {
          setSidebarOpen(false);

          if (key === "logout") {
            logout();
            return;
          }

          if (key === "inventory") return;
          if (key === "home") {
            if (navigation.popToTop) {
              navigation.popToTop();
            } else {
              navigation.navigate("HomeMain");
            }
            return;
          }
          if (key === "profile") {
            navigation.navigate("Profile");
            return;
          }
          if (key === "events") {
            navigation.navigate("Events");
            return;
          }
          if (key === "notifications") {
            navigation.navigate("Notifications" as never);
            return;
          }
          if (key === "invoices") {
            navigation.navigate("Invoices");
            return;
          }
          if (key === "messages") {
            navigation.navigate("Inbox" as never);
            return;
          }
        }}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={items}
      />

      <FolderPickerModal
        visible={showFolderPicker}
        onClose={() => {
          setShowFolderPicker(false);
          setMoveTargetId(null);
          setPickerMode("filter");
          setCreatingFolder(false);
          setNewFolderName("");
        }}
        folders={folders}
        activeFolder={activeFolder}
        onSelectFolder={(name) => {
          if (pickerMode === "move" && moveTargetId) {
            moveSingleToFolder(moveTargetId, name);
            setMoveTargetId(null);
            setPickerMode("filter");
          } else {
            setActiveFolder((prev) => (prev === name ? null : name));
          }
          setShowFolderPicker(false);
        }}
        getFolderCount={getFolderCount}
        creatingFolder={creatingFolder}
        newFolderName={newFolderName}
        onChangeFolderName={setNewFolderName}
        onStartCreate={() => setCreatingFolder(true)}
        onCancelCreate={() => {
          setCreatingFolder(false);
          setNewFolderName("");
        }}
        onConfirmCreate={() => {
          const created = handleConfirmCreateFolder();
          if (created) {
            if (pickerMode === "move" && moveTargetId) {
              moveSingleToFolder(moveTargetId, created);
              setMoveTargetId(null);
              setPickerMode("filter");
            } else if (pickerMode === "filter") {
              setActiveFolder(created);
            }
            setShowFolderPicker(false);
          }
        }}
        mode={pickerMode}
      />

      <LogoutConfirmModal
        visible={showConfirmModal}
        onConfirm={onConfirmLogout}
        onCancel={onCancelLogout}
        loading={logoutLoading}
      />
    </View>
  );
}

function InventorySkeleton({
  tab,
  viewMode,
  gridCardWidth,
}: {
  tab: "artworks" | "artists";
  viewMode: "list" | "grid";
  gridCardWidth: number;
}) {
  const listItems = Array.from({ length: 4 });
  const gridItems = Array.from({ length: 6 });

  if (viewMode === "list") {
    return (
      <View className="gap-3 animate-pulse">
        {listItems.map((_, index) => (
          <View
            key={`${tab}-list-${index}`}
            className="w-full flex-row items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3"
          >
            {tab === "artists" ? (
              <>
                <View className="h-14 w-14 rounded-full bg-slate-200" />
                <View className="flex-1 gap-2">
                  <View className="h-4 w-40 rounded bg-slate-200" />
                  <View className="h-3 w-28 rounded bg-slate-200" />
                </View>
              </>
            ) : (
              <>
                <View className="h-24 w-24 rounded-xl bg-slate-200" />
                <View className="flex-1">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-2 gap-2">
                      <View className="h-4 w-40 rounded bg-slate-200" />
                      <View className="h-3 w-28 rounded bg-slate-200" />
                    </View>
                    <View className="h-6 w-20 rounded-full bg-slate-200" />
                  </View>
                  <View className="mt-4 flex-row items-center justify-between">
                    <View className="gap-2">
                      <View className="h-3 w-24 rounded bg-slate-200" />
                      <View className="h-4 w-20 rounded bg-slate-200" />
                    </View>
                    <View className="gap-2 items-end">
                      <View className="h-3 w-16 rounded bg-slate-200" />
                      <View className="h-4 w-20 rounded bg-slate-200" />
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap gap-3 animate-pulse">
      {gridItems.map((_, index) => (
        <View
          key={`${tab}-grid-${index}`}
          className="rounded-2xl border border-slate-200 bg-white p-3"
          style={{ width: gridCardWidth }}
        >
          <View className="h-36 rounded-xl bg-slate-200 mb-3" />
          <View className="h-4 w-4/5 rounded bg-slate-200" />
          <View className="mt-2 h-3 w-2/3 rounded bg-slate-200" />
          <View className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
        </View>
      ))}
    </View>
  );
}

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { useRoute } from "@react-navigation/native";
import Sidebar from "../shared/components/Sidebar";
import { useSidebarItems } from "../shared/hooks/useSidebar";

import { useInventoryList } from "../domains/inventory/hooks/useInventoryList";
import { VIEW_MODES } from "../domains/inventory/types";
import { InventoryItemCard } from "../domains/inventory/components/list/InventoryItemCard";
import { ArtistCard } from "../domains/inventory/components/list/ArtistCard";
import { BulkActions } from "../domains/inventory/components/list/BulkActions";
import { InventoryEmptyState } from "../domains/inventory/components/list/InventoryEmptyState";
import { FolderPickerModal } from "../domains/inventory/components/list/FolderPickerModal";
import { Artwork } from "../domains/inventory/types";

export default function InventoryScreen() {
  const { height: tabBarHeight, setHidden } = useTabBarVisibility();
  const items = useSidebarItems();
  const [headerHeight, setHeaderHeight] = useState(96);
  const route = useRoute<any>();
  const lastOffset = useRef(0);
  const toastY = useRef(new Animated.Value(-120)).current;

  const {
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
    artworks,
    artists,
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

  useEffect(() => {
    const incoming: Artwork | undefined = route.params?.newArtwork;
    if (incoming) {
      addArtwork(incoming);
      navigation.setParams?.({ newArtwork: undefined });
    }
  }, [route.params?.newArtwork, addArtwork, navigation]);

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

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 32 + tabBarHeight,
          paddingHorizontal: screenPadding,
        }}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
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
        <View className="flex-row items-center gap-3 mt-4">
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
                    className={`rounded-full px-4 py-2 ${
                      isActive ? "bg-[#0B73FF]" : "bg-slate-100"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        isActive ? "text-white" : "text-slate-600"
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
                    className={`flex-row items-center gap-1 px-3 py-2 rounded-full ${
                      isActive ? "bg-white border border-slate-200" : ""
                    }`}
                  >
                    <Ionicons
                      name={mode.icon as any}
                      size={16}
                      color={isActive ? "#0B73FF" : "#475569"}
                    />
                    <Text
                      className={`text-[12px] font-semibold ${
                        isActive ? "text-[#0B73FF]" : "text-slate-600"
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

        {tab === "artworks" ? (
          <BulkActions
            selectedCount={selectedCount}
            onClear={clearSelection}
            onMoveToFolder={bulkMoveToFolder}
            onUpdateStatus={bulkUpdateStatus}
            onRemove={bulkRemove}
          />
        ) : null}

        <View className="mt-3">
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
    </View>
  );
}

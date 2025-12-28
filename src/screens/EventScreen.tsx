import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Sidebar from "../shared/components/Sidebar";
import {
  SidebarActionKey,
  useSidebarItems,
  type SidebarKey,
} from "../shared/hooks/useSidebar";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

import { useEvents } from "../domains/events/hooks/useEvents";
import EventsHostingSection from "../domains/events/components/sections/EventsHostingSection";
import YourEventsSection from "../domains/events/components/sections/YourEventsSection";
import DiscoverEventsSection from "../domains/events/components/sections/DiscoverEventsSection";
import EventHeader from "../domains/events/components/ui/EventHeader";
import CreateEventModal from "../domains/events/components/modals/CreateEventModal";
import { createEvent } from "../domains/discover/services/eventService";
import { useLogout } from "../domains/auth/hooks/useLogout";
import { LogoutConfirmModal } from "../domains/auth/components/LogoutConfirmModal";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Events">;

export default function EventScreen() {
  const navigation = useNavigation<NavigationProp>();
  const items = useSidebarItems();
  const { height: tabBarHeight, setHidden } = useTabBarVisibility();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [activeKey, setActiveKey] = useState<SidebarKey>("events");
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const screenPadding = 16;
  const lastOffset = useRef(0);
  const yourLayoutRef = useRef<{ y: number; height: number }>({
    y: 0,
    height: 0,
  });
  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  const {
    hostingEvents,
    yourEvents,
    discoverEvents,
    isInitialLoading,
    isHostingLoading,
    isMoreEventsLoading,
    hasMoreEvents,
    loadMoreEvents,
    refreshEvents,
    error,
    addHostedEvent,
    getRsvpStatus,
    setRsvpStatus,
    hostingSortOptions,
    hostingSort,
    setHostingSort,
    statusOptions,
    typeOptions,
    dateOptions,
    yourStatus,
    setYourStatus,
    yourType,
    setYourType,
    yourDateSort,
    setYourDateSort,
    discoverStatus,
    setDiscoverStatus,
    discoverType,
    setDiscoverType,
    discoverDateSort,
    setDiscoverDateSort,
    yourQuery,
    setYourQuery,
    discoverQuery,
    setDiscoverQuery,
  } = useEvents();

  useFocusEffect(
    useCallback(() => {
      setActiveKey("events");
    }, [setActiveKey])
  );

  useEffect(
    () => () => {
      setHidden(false);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    },
    [setHidden]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const diff = y - lastOffset.current;
      if ((diff > 6 && y > 24) || y > 120) {
        setHidden(true);
      } else if (diff < -6) {
        setHidden(false);
      }
      lastOffset.current = y;
    },
    [setHidden]
  );

  const {
    logout,
    loading: logoutLoading,
    showConfirmModal,
    onConfirmLogout,
    onCancelLogout,
  } = useLogout();

  const handleSidebarSelect = (key: SidebarActionKey) => {
    setSidebarOpen(false);

    if (key === "logout") {
      logout();
      return;
    }

    if (key === "home") {
      if (navigation.popToTop) {
        navigation.popToTop();
      } else {
        navigation.navigate("HomeMain");
      }
      return;
    }

    if (key === "inventory") {
      navigation.navigate("Inventory");
      return;
    }

    if (key === "profile") {
      navigation.navigate("Profile");
      return;
    }

    if (key === "events") return;
  };

  const handleCreateEvent = () => {
    setShowCreateEvent(true);
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshEvents();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refreshEvents]);

  const handleRsvpChange = useCallback(
    async (id: string, status: "none" | "going" | "maybe" | "notGoing") => {
      try {
        await setRsvpStatus(id, status);
        showToast("Updated successfully");
      } catch (error) {
        console.error("Failed to update RSVP:", error);
        showToast("Failed to update RSVP");
      }
    },
    [setRsvpStatus, showToast]
  );

  const handleOpenEvent = useCallback(
    (event: any) => {
      const initialRsvp = getRsvpStatus(event.id);
      navigation.navigate("EventDetail", {
        id: event.id,
        initialRsvp,
        onRsvpChange: (status) => handleRsvpChange(event.id, status),
        event,
      });
    },
    [navigation, getRsvpStatus, handleRsvpChange]
  );

  const handleYourLayout = useCallback(
    (layout: { x: number; y: number; width: number; height: number }) => {
      const prev = yourLayoutRef.current;
      yourLayoutRef.current = { y: layout.y, height: layout.height };
      const delta = layout.height - prev.height;
      if (!delta) return;
      // Only adjust if user is scrolled past the Your Events block to prevent upward jump
      if (lastOffset.current > layout.y && scrollRef.current) {
        const nextOffset = lastOffset.current + delta;
        if (typeof (scrollRef.current as any).scrollTo === "function") {
          (scrollRef.current as any).scrollTo({ y: nextOffset, animated: false });
          lastOffset.current = nextOffset;
        } else if (typeof (scrollRef.current as any).scrollToPosition === "function") {
          (scrollRef.current as any).scrollToPosition(0, nextOffset, false);
          lastOffset.current = nextOffset;
        }
      }
    },
    []
  );

  return (
    <View className="flex-1 bg-white">
      <EventHeader
        onPressBack={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("HomeMain");
          }
        }}
        onPressSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      />

      {toastMessage ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: screenPadding,
            right: screenPadding,
            top: Math.max(headerHeight - 6, 24),
            zIndex: 30,
            elevation: 8,
          }}
        >
          <View className="rounded-2xl border border-[#0B73FF] bg-white px-4 py-3 shadow-lg shadow-[#0B73FF]/30">
            <View className="flex-row items-center gap-2">
              <View className="h-8 w-8 rounded-full bg-[#E0F2FE] items-center justify-center">
                <Ionicons name="checkmark-done" size={18} color="#0B73FF" />
              </View>
              <Text className="text-sm font-semibold text-slate-900 flex-1">
                {toastMessage}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <KeyboardAwareScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: screenPadding,
          paddingTop: 16,
          paddingBottom: 24 + tabBarHeight,
          rowGap: 18,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={150}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <EventsHostingSection
          events={hostingEvents}
          sortOptions={hostingSortOptions}
          sortValue={hostingSort}
          onChangeSort={setHostingSort}
          onCreateEvent={handleCreateEvent}
          getRsvpStatus={getRsvpStatus}
          onChangeRsvp={handleRsvpChange}
          onPressEvent={handleOpenEvent}
          isLoading={isHostingLoading}
        />

        <YourEventsSection
          events={yourEvents}
          statusOptions={statusOptions}
          typeOptions={typeOptions}
          dateOptions={dateOptions}
          statusValue={yourStatus}
          typeValue={yourType}
          dateValue={yourDateSort}
          onChangeStatus={setYourStatus}
          onChangeType={setYourType}
          onChangeDate={setYourDateSort}
          query={yourQuery}
          onChangeQuery={setYourQuery}
          getRsvpStatus={getRsvpStatus}
          onChangeRsvp={handleRsvpChange}
          onPressEvent={handleOpenEvent}
          onLayout={handleYourLayout}
        />

        <DiscoverEventsSection
          events={discoverEvents}
          statusOptions={statusOptions}
          typeOptions={typeOptions}
          dateOptions={dateOptions}
          statusValue={discoverStatus}
          typeValue={discoverType}
          dateValue={discoverDateSort}
          onChangeStatus={setDiscoverStatus}
          onChangeType={setDiscoverType}
          onChangeDate={setDiscoverDateSort}
          query={discoverQuery}
          onChangeQuery={setDiscoverQuery}
          getRsvpStatus={getRsvpStatus}
          onChangeRsvp={handleRsvpChange}
          onPressEvent={handleOpenEvent}
          isLoading={isInitialLoading}
          isFetchingNextPage={isMoreEventsLoading}
          onEndReached={loadMoreEvents}
        />
      </KeyboardAwareScrollView>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={items}
      />

        <CreateEventModal
          visible={showCreateEvent}
          typeOptions={typeOptions}
          onClose={() => setShowCreateEvent(false)}
          onCreate={async (event) => {
            try {
              const saved = await createEvent(event);
              addHostedEvent(saved);
              showToast("Event created");
              return true;
            } catch (e) {
              showToast("Failed to create event");
              return false;
            }
          }}
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

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  View,
  Text,
} from "react-native";
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
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastOffset = useRef(0);
  const yourLayoutRef = useRef<{ y: number; height: number }>({
    y: 0,
    height: 0,
  });
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

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
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
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

  const { logout } = useLogout();

  const handleSidebarSelect = async (key: SidebarActionKey) => {
    setSidebarOpen(false);

    if (key === "logout") {
      await logout();
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
    (id: string, status: "none" | "going" | "maybe" | "notGoing") => {
      setRsvpStatus(id, status);
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
      setToastMessage("Updated successfully");
      toastTimer.current = setTimeout(() => setToastMessage(null), 1200);
    },
    [setRsvpStatus]
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
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      />

      <KeyboardAwareScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
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
              setIsCreating(true);
              const saved = await createEvent(event);
              addHostedEvent(saved);
              setShowCreateEvent(false);
              setToastMessage("Event created");
              toastTimer.current = setTimeout(() => setToastMessage(null), 1200);
            } catch (e) {
              setToastMessage("Failed to create event");
              toastTimer.current = setTimeout(() => setToastMessage(null), 1500);
            } finally {
              setIsCreating(false);
            }
          }}
        />

        {toastMessage ? (
        <View
          pointerEvents="none"
          className="absolute left-0 right-0 items-center"
          style={{ bottom: 24 + tabBarHeight }}
        >
          <View className="px-4 py-2 rounded-full bg-black/80">
            <Text className="text-[13px] font-semibold text-white">
              {toastMessage}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

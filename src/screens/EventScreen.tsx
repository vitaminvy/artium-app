import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Sidebar from "../shared/components/Sidebar";
import { useSidebarItems, type SidebarKey } from "../shared/hooks/useSidebar";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

import { useEvents } from "../domains/events/hooks/useEvents";
import EventsHostingSection from "../domains/events/components/sections/EventsHostingSection";
import YourEventsSection from "../domains/events/components/sections/YourEventsSection";
import DiscoverEventsSection from "../domains/events/components/sections/DiscoverEventsSection";
import EventHeader from "../domains/events/components/ui/EventHeader";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Events">;

export default function EventScreen() {
  const navigation = useNavigation<NavigationProp>();
  const items = useSidebarItems();
  const { height: tabBarHeight, setHidden } = useTabBarVisibility();
  const scrollRef = useRef<KeyboardAwareScrollView>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [activeKey, setActiveKey] = useState<SidebarKey>("events");
  const lastOffset = useRef(0);

  const {
    hostingEvents,
    yourEvents,
    discoverEvents,
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

  const handleSidebarSelect = (key: SidebarKey | "more") => {
    setSidebarOpen(false);

    if (key === "more") return;

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

  const handleCreateEvent = () => {};

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
        onPressMenu={() => setSidebarOpen((prev) => !prev)}
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
      >
        <EventsHostingSection
          events={hostingEvents}
          sortOptions={hostingSortOptions}
          sortValue={hostingSort}
          onChangeSort={setHostingSort}
          onCreateEvent={handleCreateEvent}
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
    </View>
  );
}

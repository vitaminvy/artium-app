import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";

import { useDiscover } from "../domains/discover/hooks/useDiscover";
import { DiscoverTab } from "../domains/discover/types";
import { TabChip } from "../domains/discover/components/ui/DiscoverShared";
import ChangeLocationSheet from "../domains/discover/components/sheets/ChangeLocationSheet";

// Import Refactored Tabs
import DiscoverArtworksTab from "../domains/discover/components/tabs/DiscoverArtworksTab";
import DiscoverProfilesTab from "../domains/discover/components/tabs/DiscoverProfilesTab";
import DiscoverEventsTab from "../domains/discover/components/tabs/DiscoverEventsTab";
import DiscoverMomentsTab from "../domains/discover/components/tabs/DiscoverMomentsTab";
import DiscoverNearbyTab from "../domains/discover/components/tabs/DiscoverNearbyTab";

const TABS: { key: DiscoverTab; label: string }[] = [
  { key: "topPicks", label: "TOP PICKS" },
  { key: "nearby", label: "NEARBY" },
  { key: "artworks", label: "ARTWORKS" },
  { key: "profiles", label: "PROFILES" },
  { key: "moments", label: "MOMENTS" },
  { key: "events", label: "EVENTS" },
];

export default function DiscoverScreen() {
  const {
    tab,
    setTab,
    topPicks,
    artworks,
    profiles,
    moments,
    events,
  } = useDiscover();

  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [locationText, setLocationText] = useState("Albuquerque, NM, USA");
  const [radius, setRadius] = useState("10 miles");
  const [showRadiusOptions, setShowRadiusOptions] = useState(false);

  const renderContent = () => {
    switch (tab) {
      case "topPicks":
        return <DiscoverArtworksTab data={topPicks} />;
      case "artworks":
        return <DiscoverArtworksTab data={artworks} />;
      case "profiles":
        return <DiscoverProfilesTab data={profiles} />;
      case "events":
        return <DiscoverEventsTab data={events} />;
      case "moments":
        return <DiscoverMomentsTab data={moments} />;
      case "nearby":
        return (
          <DiscoverNearbyTab
            artworks={artworks}
            profiles={profiles}
            events={events}
            locationText={locationText}
            radius={radius}
            onOpenLocationSheet={() => setShowLocationSheet(true)}
            onSwitchTab={setTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Discover"
        badgeLabel="Blog"
        actionType="search"
        onPressAction={() => {}}
        underlineSource={UnderlineHome}
      />

      <View className="bg-white border-b border-slate-100 pt-2 pb-3">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tabBarContent}
        >
          {TABS.map((item) => (
            <TabChip
              key={item.key}
              label={item.label}
              active={tab === item.key}
              onPress={() => setTab(item.key)}
            />
          ))}
        </ScrollView>
      </View>

      {renderContent()}

      <ChangeLocationSheet
        visible={showLocationSheet}
        locationText={locationText}
        radius={radius}
        onChangeLocation={setLocationText}
        onChangeRadius={setRadius}
        showRadiusOptions={showRadiusOptions}
        setShowRadiusOptions={setShowRadiusOptions}
        onClose={() => setShowLocationSheet(false)}
        onApply={() => setShowLocationSheet(false)}
      />
    </View>
  );
}

const tabBarContent = {
  paddingHorizontal: 16,
  paddingVertical: 6,
  flexDirection: "row" as const,
  gap: 10,
  alignItems: "center" as const,
};

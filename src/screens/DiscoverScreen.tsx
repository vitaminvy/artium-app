import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";

import { useDiscover } from "../domains/discover/hooks/useDiscover";
import { DiscoverTab } from "../domains/discover/types";
import { TabChip } from "../domains/discover/components/ui/DiscoverShared";
import ChangeLocationSheet from "../domains/discover/components/sheets/ChangeLocationSheet";
import { useAuth } from "@/domains/auth/contexts/AuthContext";

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
  const navigation = useNavigation<any>();
  const { status } = useAuth();
  const { tab, setTab, topPicks, artworks, profiles, moments, events } =
    useDiscover();
  const isGuest = status !== "authenticated";

  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [locationText, setLocationText] = useState("Albuquerque, NM, USA");
  const [radius, setRadius] = useState("10 miles");
  const [showRadiusOptions, setShowRadiusOptions] = useState(false);

  const renderContent = () => {
    const onCardPress = isGuest ? handleRequireSignUp : undefined;

    switch (tab) {
      case "topPicks":
        return <DiscoverArtworksTab data={topPicks} onCardPress={onCardPress} />;
      case "artworks":
        return <DiscoverArtworksTab data={artworks} onCardPress={onCardPress} />;
      case "profiles":
        return <DiscoverProfilesTab data={profiles} onCardPress={onCardPress} />;
      case "events":
        return <DiscoverEventsTab data={events} onCardPress={onCardPress} />;
      case "moments":
        return <DiscoverMomentsTab data={moments} onCardPress={onCardPress} />;
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
            onCardPress={onCardPress}
          />
        );
      default:
        return null;
    }
  };

  const handleRequireSignUp = useCallback((_: unknown) => {
    navigation.navigate("SignUp");
  }, [navigation]);

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

      {isGuest && (
        <View style={styles.guestSheet}>
          <Text style={styles.guestText}>
            Create an account for the full Artium experience
          </Text>
          <Pressable style={styles.guestButton} onPress={handleRequireSignUp}>
            <Text style={styles.guestButtonText}>SIGN UP NOW</Text>
          </Pressable>
        </View>
      )}
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

const GUEST_SHEET_HEIGHT = 170;

const styles = StyleSheet.create({
  guestSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    height: GUEST_SHEET_HEIGHT,
    backgroundColor: "white",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    zIndex: 10,
  },
  guestText: {
    textAlign: "center",
    color: "#334155",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  guestButton: {
    backgroundColor: "#2D74ED",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2D74ED",
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

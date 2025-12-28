import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { DiscoverStackParamList } from "../app/navigation/Stack/DiscoverStack";
import ScreenHeader from "../shared/components/ScreenHeader";
import UnderlineHome from "../../assets/headers/underline-home.svg";

import { useDiscover } from "../domains/discover/hooks/useDiscover";
import { DiscoverTab } from "../domains/discover/types";
import { TabChip } from "../domains/discover/components/ui/DiscoverShared";
import ChangeLocationSheet from "../domains/discover/components/sheets/ChangeLocationSheet";
import Loader from "../shared/components/Loader";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { useProfileContext } from "../domains/user/contexts/ProfileContext";
import { toggleEventRsvp } from "../domains/discover/services/eventService";

// Import Tabs
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

type NavigationProp = NativeStackNavigationProp<DiscoverStackParamList>;

export default function DiscoverScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { status, currentUser } = useAuth();
  const { isFollowing, toggleFollow } = useProfileContext();
  const {
    tab,
    setTab,
    loading,
    error,
    topPicks,
    artworks,
    loadMoreArtworks,
    isMoreArtworksLoading,
    hasMoreArtworks,
    moments,
    loadMoreMoments,
    isMoreMomentsLoading,
    hasMoreMoments,
    profiles,
    loadMoreProfiles,
    isMoreProfilesLoading,
    hasMoreProfiles,
    events,
    loadMoreEvents,
    isMoreEventsLoading,
    hasMoreEvents,
    updateEventRsvp,
  } = useDiscover();

  const isGuest = status !== "authenticated";
  const { setHidden } = useTabBarVisibility();
  const lastOffset = useRef(0);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const diff = y - lastOffset.current;
      if ((diff > 6 && y > 16) || y > 120) {
        setHidden(true);
      } else if (diff < -6) {
        setHidden(false);
      }
      lastOffset.current = y;
    },
    [setHidden]
  );

  useEffect(() => {
    return () => {
      setHidden(false);
    };
  }, [setHidden]);

  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [locationText, setLocationText] = useState("Albuquerque, NM, USA");
  const [radius, setRadius] = useState("10 miles");
  const [showRadiusOptions, setShowRadiusOptions] = useState(false);
  const handleRequireSignUp = useCallback(() => {
    navigation.navigate("SignUp");
  }, [navigation]);
  const filteredProfiles = React.useMemo(
    () => profiles.filter((p) => p.id !== currentUser?.uid),
    [profiles, currentUser?.uid]
  );

  const handleRsvpChange = useCallback(async (eventId: string, status: "none" | "going" | "maybe" | "notGoing") => {
    // Update local state immediately
    updateEventRsvp(eventId, status);

    // Persist to Firestore if user is authenticated
    if (currentUser?.uid && status !== "none") {
      try {
        await toggleEventRsvp(currentUser.uid, eventId, status);
        console.log("[DiscoverScreen] RSVP persisted to Firestore:", eventId, status);
      } catch (error) {
        console.error("[DiscoverScreen] Failed to persist RSVP:", error);
        // Optionally: revert local state on error
      }
    }
  }, [currentUser?.uid, updateEventRsvp]);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <Loader />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-red-500 text-center">
            Failed to load content. Please try again later.
          </Text>
        </View>
      );
    }

    const onCardPress = isGuest ? handleRequireSignUp : undefined;

    switch (tab) {
      case "topPicks":
        return <DiscoverArtworksTab data={topPicks} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={() => {}} isFetchingNextPage={false} />;
      case "artworks":
        return <DiscoverArtworksTab data={artworks} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={loadMoreArtworks} isFetchingNextPage={isMoreArtworksLoading} />;
      case "profiles":
        return (
          <DiscoverProfilesTab
            data={filteredProfiles}
            onCardPress={onCardPress}
            onScroll={handleScroll}
            onEndReached={loadMoreProfiles}
            isFetchingNextPage={isMoreProfilesLoading}
            isFollowing={isFollowing}
            onToggleFollow={toggleFollow}
          />
        );
      case "events":
        return <DiscoverEventsTab
          data={events}
          onCardPress={isGuest ? handleRequireSignUp : (item) => navigation.navigate("EventDetail", {
            event: item,
            onRsvpChange: (status) => handleRsvpChange(item.id, status)
          })}
          onScroll={handleScroll}
          onEndReached={loadMoreEvents}
          isFetchingNextPage={isMoreEventsLoading}
        />;
      case "moments":
        return <DiscoverMomentsTab data={moments} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={loadMoreMoments} isFetchingNextPage={isMoreMomentsLoading} />;
      case "nearby":
        return (
          <DiscoverNearbyTab
            artworks={artworks}
            profiles={filteredProfiles}
            events={events}
            locationText={locationText}
            radius={radius}
            onOpenLocationSheet={() => setShowLocationSheet(true)}
            onSwitchTab={setTab}
            onCardPress={onCardPress}
            onScroll={handleScroll}
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

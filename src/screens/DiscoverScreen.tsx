import React, { useCallback, useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

export default function DiscoverScreen() {
  const navigation = useNavigation<any>();
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
  const [searchQuery, setSearchQuery] = useState("");
  const handleRequireSignUp = useCallback(() => {
    navigation.navigate("SignUp");
  }, [navigation]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filterArtwork = useCallback(
    (item: any) => {
      if (!normalizedQuery) return true;
      const haystack = [
        item.title,
        item.artist,
        item.price,
        item.location,
        Array.isArray(item.tags) ? item.tags.join(" ") : undefined,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    },
    [normalizedQuery]
  );
  const filterProfile = useCallback(
    (item: any) => {
      if (!normalizedQuery) return true;
      const haystack = [item.name, item.title, item.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    },
    [normalizedQuery]
  );
  const filterEvent = useCallback(
    (item: any) => {
      if (!normalizedQuery) return true;
      const haystack = [
        item.title,
        item.location,
        item.category,
        item.eventType,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    },
    [normalizedQuery]
  );

  const filteredProfiles = React.useMemo(
    () =>
      profiles
        .filter((p) => p.id !== currentUser?.uid)
        .filter(filterProfile),
    [profiles, currentUser?.uid, filterProfile]
  );
  const filteredTopPicks = React.useMemo(
    () => topPicks.filter(filterArtwork),
    [topPicks, filterArtwork]
  );
  const filteredArtworks = React.useMemo(
    () => artworks.filter(filterArtwork),
    [artworks, filterArtwork]
  );
  const filteredMoments = React.useMemo(
    () => moments.filter(filterArtwork),
    [moments, filterArtwork]
  );
  const filteredEvents = React.useMemo(
    () => events.filter(filterEvent),
    [events, filterEvent]
  );

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
        return <DiscoverArtworksTab data={filteredTopPicks} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={() => {}} isFetchingNextPage={false} />;
      case "artworks":
        return <DiscoverArtworksTab data={filteredArtworks} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={loadMoreArtworks} isFetchingNextPage={isMoreArtworksLoading} />;
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
        return <DiscoverEventsTab data={filteredEvents} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={loadMoreEvents} isFetchingNextPage={isMoreEventsLoading} />;
      case "moments":
        return <DiscoverMomentsTab data={filteredMoments} onCardPress={onCardPress} onScroll={handleScroll} onEndReached={loadMoreMoments} isFetchingNextPage={isMoreMomentsLoading} />;
      case "nearby":
        return (
          <DiscoverNearbyTab
            artworks={filteredArtworks}
            profiles={filteredProfiles}
            events={filteredEvents}
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
        <View className="px-4 mt-3">
          <View className="flex-row items-center rounded-full border border-slate-200 bg-slate-50 px-3">
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search artworks, profiles, events"
              placeholderTextColor="#94A3B8"
              className="flex-1 px-2 py-2 text-sm text-slate-900"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </Pressable>
            ) : null}
          </View>
        </View>
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

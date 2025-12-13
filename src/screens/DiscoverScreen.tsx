import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  ListRenderItemInfo,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";

import { useDiscover } from "../domains/discover/hooks/useDiscover";
import {
  ArtistProfile,
  Artwork,
  DiscoverTab,
  EventItem,
  InspirationArticle,
} from "../domains/discover/types";

// UI Components
import { TabChip, Section } from "../domains/discover/components/ui/DiscoverShared";
import ChangeLocationSheet from "../domains/discover/components/sheets/ChangeLocationSheet";

// Cards
import ArtworkCard from "../domains/discover/components/cards/ArtworkCard";
import ProfileCard from "../domains/discover/components/cards/ProfileCard";
import EventCard from "../domains/discover/components/cards/EventCard";
import MomentCard from "../domains/discover/components/cards/MomentCard";
import InspirationCard from "../domains/discover/components/cards/InspirationCard";

const TABS: { key: DiscoverTab; label: string }[] = [
  { key: "topPicks", label: "TOP PICKS" },
  { key: "nearby", label: "NEARBY" },
  { key: "artworks", label: "ARTWORKS" },
  { key: "profiles", label: "PROFILES" },
  { key: "moments", label: "MOMENTS" },
  { key: "events", label: "EVENTS" },
  { key: "inspiration", label: "GET INSPIRED" },
];

export default function DiscoverScreen() {
  const navigation = useNavigation();
  const {
    tab,
    setTab,
    topPicks,
    artworks,
    profiles,
    moments,
    events,
    inspirations,
  } = useDiscover();
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [locationText, setLocationText] = useState("Albuquerque, NM, USA");
  const [radius, setRadius] = useState("10 miles");
  const [showRadiusOptions, setShowRadiusOptions] = useState(false);

  // --- Render Helpers ---

  const renderArtwork = ({ item }: ListRenderItemInfo<Artwork>) => (
    <ArtworkCard
      item={item}
      onPress={() =>
        (navigation.navigate as any)("ArtworkDetail", { id: item.id })
      }
    />
  );

  const renderProfile = ({ item }: ListRenderItemInfo<ArtistProfile>) => (
    <ProfileCard item={item} />
  );

  const renderEvent = ({ item }: ListRenderItemInfo<EventItem>) => (
    <EventCard item={item} />
  );

  const renderInspiration = ({
    item,
  }: ListRenderItemInfo<InspirationArticle>) => <InspirationCard item={item} />;

  // --- Main Content Switcher ---

  const renderContent = () => {
    const gridProps = {
      numColumns: 2,
      contentContainerStyle: {
        paddingHorizontal: 12,
        paddingBottom: 20,
        rowGap: 12,
      },
      columnWrapperStyle: { columnGap: 12 },
      showsVerticalScrollIndicator: false,
    };

    switch (tab) {
      case "topPicks":
      case "artworks":
        return (
          <FlatList
            key={tab} // Force re-render when switching between similar lists
            data={tab === "topPicks" ? topPicks : artworks}
            keyExtractor={(item) => item.id}
            renderItem={renderArtwork}
            {...gridProps}
          />
        );
      case "profiles":
        return (
          <FlatList
            key="profiles"
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={renderProfile}
            {...gridProps}
          />
        );
      case "moments":
        return (
          <FlatList
            key="moments"
            data={moments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MomentCard
                item={item}
                onPress={() =>
                  (navigation.navigate as any)("ArtworkDetail", { id: item.id })
                }
              />
            )}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 20,
              rowGap: 16,
            }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "events":
        return (
          <FlatList
            key="events"
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderEvent}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 24,
              rowGap: 12,
            }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "inspiration":
        return (
          <FlatList
            key="inspirations"
            data={inspirations}
            keyExtractor={(item) => item.id}
            renderItem={renderInspiration}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 24,
              rowGap: 12,
            }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "nearby":
        return (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-4 py-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={18} color="#0F172A" />
                <Text className="text-sm font-semibold text-slate-800">
                  {locationText}
                </Text>
                <Text className="text-xs text-slate-500">• {radius}</Text>
              </View>
              <Pressable
                className="px-3 py-2 rounded-full bg-slate-100"
                onPress={() => setShowLocationSheet(true)}
              >
                <Text className="text-xs font-semibold text-slate-600">
                  Change
                </Text>
              </Pressable>
            </View>

            <Section
              title="Artworks"
              actionLabel="See all"
              onAction={() => setTab("artworks")}
            >
              <FlatList
                key="nearby-artworks"
                data={artworks}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={renderArtwork}
                scrollEnabled={false}
                columnWrapperStyle={{ columnGap: 12 }}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  rowGap: 12,
                  paddingBottom: 12,
                }}
              />
            </Section>

            <Section
              title="Artists"
              actionLabel="See all"
              onAction={() => setTab("profiles")}
            >
              <FlatList
                key="nearby-profiles"
                data={profiles.slice(0, 4)}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={renderProfile}
                scrollEnabled={false}
                columnWrapperStyle={{ columnGap: 12 }}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  rowGap: 12,
                  paddingBottom: 12,
                }}
              />
            </Section>

            <Section
              title="Events"
              actionLabel="See all"
              onAction={() => setTab("events")}
            >
              <FlatList
                key="nearby-events"
                data={events.slice(0, 3)}
                keyExtractor={(item) => item.id}
                renderItem={renderEvent}
                scrollEnabled={false}
                contentContainerStyle={{
                  paddingHorizontal: 12,
                  rowGap: 12,
                }}
              />
            </Section>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* TODO: Fix SVG import or use ScreenHeader properly */}
      <ScreenHeader
        title="Discover"
        badgeLabel="Blog"
        actionType="search"
        onPressAction={() => {}}
        // Temporarily commented out until SVG loader is fixed or asset is available
        // underlineSource={require("../../assets/headers/underline-home.svg")}
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
import React from "react";
import { View, Text, ScrollView, Pressable, FlatList, ListRenderItemInfo } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Artwork, ArtistProfile, EventItem, DiscoverTab } from "../../types";
import { Section } from "../ui/DiscoverShared";
import { DISCOVER_STRINGS } from "../../constants";

import ArtworkCard from "../cards/ArtworkCard";
import ProfileCard from "../cards/ProfileCard";
import EventCard from "../cards/EventCard";

type Props = {
  artworks: Artwork[];
  profiles: ArtistProfile[];
  events: EventItem[];
  locationText: string;
  radius: string;
  onOpenLocationSheet: () => void;
  onSwitchTab: (tab: DiscoverTab) => void;
  onCardPress?: () => void;
};

export default function DiscoverNearbyTab({
  artworks,
  profiles,
  events,
  locationText,
  radius,
  onOpenLocationSheet,
  onSwitchTab,
  onCardPress,
}: Props) {
  const navigation = useNavigation();

  // Render Helpers
  const renderArtwork = ({ item }: ListRenderItemInfo<Artwork>) => (
    <ArtworkCard
      item={item}
      onPress={() =>
        onCardPress
          ? onCardPress()
          : (navigation.navigate as any)("ArtworkDetail", { id: item.id })
      }
    />
  );
  
  const renderProfile = ({ item }: ListRenderItemInfo<ArtistProfile>) => (
    <ProfileCard item={item} onPress={onCardPress} />
  );

  const renderEvent = ({ item }: ListRenderItemInfo<EventItem>) => (
    <EventCard item={item} onPress={onCardPress} />
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
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
          onPress={onOpenLocationSheet}
        >
          <Text className="text-xs font-semibold text-slate-600">
            {DISCOVER_STRINGS.CHANGE_BUTTON}
          </Text>
        </Pressable>
      </View>

      <Section
        title={DISCOVER_STRINGS.SECTION_ARTWORKS}
        actionLabel={DISCOVER_STRINGS.SEE_ALL}
        onAction={() => onSwitchTab("artworks")}
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
        title={DISCOVER_STRINGS.SECTION_ARTISTS}
        actionLabel={DISCOVER_STRINGS.SEE_ALL}
        onAction={() => onSwitchTab("profiles")}
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
        title={DISCOVER_STRINGS.SECTION_EVENTS}
        actionLabel={DISCOVER_STRINGS.SEE_ALL}
        onAction={() => onSwitchTab("events")}
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
}

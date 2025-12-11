// src/screens/DiscoverScreen.tsx
import React from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  Image,
  ListRenderItemInfo,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { useDiscover } from "../domains/discover/hooks/useDiscover";
import {
  ArtistProfile,
  Artwork,
  DiscoverTab,
  EventItem,
  InspirationArticle,
} from "../domains/discover/types";

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

  const renderContent = () => {
    switch (tab) {
      case "topPicks":
        return (
          <FlatList
            data={topPicks}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderArtwork}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 20,
              rowGap: 12,
            }}
            columnWrapperStyle={{ columnGap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "artworks":
        return (
          <FlatList
            data={artworks}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderArtwork}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 20,
              rowGap: 12,
            }}
            columnWrapperStyle={{ columnGap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "moments":
        return (
          <FlatList
            data={moments}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderArtwork}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 20,
              rowGap: 12,
            }}
            columnWrapperStyle={{ columnGap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "profiles":
        return (
          <FlatList
            data={profiles}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderProfile}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 20,
              rowGap: 12,
            }}
            columnWrapperStyle={{ columnGap: 12 }}
            showsVerticalScrollIndicator={false}
          />
        );
      case "events":
        return (
          <FlatList
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
                  Albuquerque, NM, USA
                </Text>
                <Text className="text-xs text-slate-500">• 10 miles</Text>
              </View>
              <Pressable className="px-3 py-2 rounded-full bg-slate-100">
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <FlatList
          data={TABS}
          keyExtractor={(item) => item.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            columnGap: 8,
          }}
          renderItem={({ item }) => (
            <TabChip
              label={item.label}
              active={tab === item.key}
              onPress={() => setTab(item.key)}
            />
          )}
        />

        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

type TabChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function TabChip({ label, active, onPress }: TabChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        active ? "bg-slate-900 border-slate-900" : "border-slate-200"
      }`}
    >
      <Text
        className={`text-[12px] font-semibold ${
          active ? "text-white" : "text-slate-700"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Section({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="py-3">
      <View className="px-4 mb-2 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">{title}</Text>
        {actionLabel ? (
          <Pressable onPress={onAction}>
            <Text className="text-xs font-semibold text-slate-500">
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function ArtworkCard({
  item,
  onPress,
}: {
  item: Artwork;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="h-48 w-full"
        resizeMode="cover"
      />

      <View className="px-4 py-3 gap-2">
        {item.isTrending && <Badge label="TRENDING" color="#EA580C" />}

        <View className="flex-row items-center gap-2">
          <View className="h-6 w-6 rounded-full bg-slate-200 overflow-hidden">
            {item.artistAvatar ? (
              <Image
                source={{ uri: item.artistAvatar }}
                className="h-full w-full"
              />
            ) : null}
          </View>
          <Text className="text-xs text-slate-500">{item.artist}</Text>
        </View>

        <Text className="text-base font-semibold text-slate-900">
          {item.title}
        </Text>

        <View className="flex-row items-center gap-2">
          {item.spice && <Badge label="SPICE" color="#2563EB" ghost />}
          {item.location ? (
            <Text className="text-xs text-slate-400">{item.location}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ProfileCard({ item }: { item: ArtistProfile }) {
  return (
    <View
      className="flex-1 rounded-3xl bg-white border border-slate-100 px-4 py-5 items-center"
      style={cardShadow}
    >
      <View className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
        <Image source={{ uri: item.avatar }} className="h-full w-full" />
      </View>
      <Text className="mt-3 text-base font-semibold text-slate-900 text-center">
        {item.name}
      </Text>
      <View className="flex-row items-center gap-1">
        {item.verified && (
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
        )}
        {item.title ? (
          <Text className="text-xs text-slate-500">{item.title}</Text>
        ) : null}
      </View>

      <Pressable className="mt-4 px-4 py-2 rounded-full bg-slate-900 active:opacity-90">
        <Text className="text-xs font-semibold text-white">Follow</Text>
      </Pressable>
    </View>
  );
}

function EventCard({ item }: { item: EventItem }) {
  const date = new Date(item.datetime);
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = date.getDate();

  return (
    <View
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="h-40 w-full"
          resizeMode="cover"
        />
        <View className="absolute top-3 right-3 bg-white rounded-xl px-2 py-1 items-center">
          <Text className="text-[10px] font-bold text-slate-900">{month}</Text>
          <Text className="text-base font-extrabold text-blue-600 leading-4">
            {day}
          </Text>
        </View>
      </View>

      <View className="px-4 py-4 gap-2">
        <View className="flex-row items-center gap-2">
          {item.status ? (
            <Badge
              label={item.status === "ongoing" ? "ONGOING" : "UPCOMING"}
              color={item.status === "ongoing" ? "#22C55E" : "#2563EB"}
              ghost
            />
          ) : null}
          {item.attendees ? (
            <Text className="text-xs text-slate-500">
              {item.attendees} attendees
            </Text>
          ) : null}
        </View>

        <Text className="text-base font-semibold text-slate-900">
          {item.title}
        </Text>
        <Text className="text-xs text-slate-500">{item.location}</Text>

        <Pressable className="mt-2 px-4 py-3 rounded-2xl bg-slate-900 self-start active:opacity-90">
          <Text className="text-xs font-semibold text-white">
            {item.rsvpLabel ?? "RSVP"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function InspirationCard({ item }: { item: InspirationArticle }) {
  const date = new Date(item.publishedAt);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <View
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="h-44 w-full"
        resizeMode="cover"
      />
      <View className="px-4 py-4 gap-2">
        <Text className="text-xs font-semibold text-slate-500">
          {item.category}
        </Text>
        <Text className="text-base font-semibold text-slate-900">
          {item.title}
        </Text>
        <Text className="text-xs text-slate-500">
          {item.author} • {dateLabel} • {item.readTime}
        </Text>
      </View>
    </View>
  );
}

function Badge({
  label,
  color,
  ghost,
}: {
  label: string;
  color: string;
  ghost?: boolean;
}) {
  const backgroundColor = ghost ? `${color}15` : color;
  const textColor = ghost ? color : "#FFFFFF";

  return (
    <View
      className="self-start rounded-full px-2.5 py-1"
      style={{ backgroundColor }}
    >
      <Text
        className={`text-[10px] font-semibold uppercase`}
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

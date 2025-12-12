
import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  Image,
  ListRenderItemInfo,
  ScrollView,
  Modal,
  TextInput,
  Animated,
  Easing,
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
            key="top-picks"
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
            key="artworks"
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
      case "profiles":
        return (
          <FlatList
            key="profiles"
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
      <ScreenHeader
        title="Discover"
        badgeLabel="Blog"
        actionType="search"
        onPressAction={() => {}}
        underlineSource={require("../../assets/headers/underline-home.svg")}
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

type TabChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

function TabChip({ label, active, onPress }: TabChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border"
      style={[
        chipStyle,
        {
          backgroundColor: active ? "#0B1223" : "#FFFFFF",
          borderColor: active ? "#0B1223" : "#E2E8F0",
        },
      ]}
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
      className="flex-1 bg-white overflow-hidden"
      style={[cardShadow, cardContainer]}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          className="w-full"
          style={{ aspectRatio: 3 / 4, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
          resizeMode="cover"
        />
        {item.isTrending && (
          <View
            className="absolute bottom-3 left-3 flex-row items-center gap-1 rounded-full px-3 py-1"
            style={{
              backgroundColor: "rgba(255,255,255,0.32)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.55)",
            }}
          >
            <Ionicons name="flame" size={14} color="#EA580C" />
            <Text className="text-[11px] font-semibold text-[#EA580C]">
              TRENDING
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 py-4 gap-3 bg-white rounded-b-[28px]">
        <View className="flex-row items-center gap-3">
          <View className="h-7 w-7 rounded-full bg-slate-200 overflow-hidden">
            {item.artistAvatar ? (
              <Image
                source={{ uri: item.artistAvatar }}
                className="h-full w-full"
              />
            ) : null}
          </View>
          <Text className="text-sm text-slate-600 font-medium">
            {item.artist}
          </Text>
        </View>

        <Text className="text-[18px] font-bold text-slate-900">
          {item.title}
        </Text>

        <View className="flex-row items-center gap-3 flex-wrap">
          {item.price ? <Pill label={item.price} color="#2563EB" /> : null}
          {item.location ? (
            <Text className="text-sm text-slate-400">{item.location}</Text>
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

function MomentCard({
  item,
  onPress,
}: {
  item: Artwork;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-3xl bg-white border border-slate-100 overflow-hidden"
      style={cardShadow}
    >
      <Image
        source={{ uri: item.image }}
        className="w-full"
        style={{ aspectRatio: 3 / 4 }}
        resizeMode="cover"
      />
      <View className="px-4 py-4 gap-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden">
              {item.artistAvatar ? (
                <Image
                  source={{ uri: item.artistAvatar }}
                  className="h-full w-full"
                />
              ) : null}
            </View>
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-semibold text-slate-800">
                {item.artist}
              </Text>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
            </View>
          </View>
          <View className="flex-row items-center gap-3">
            <Pressable className="flex-row items-center gap-1 active:opacity-80">
              <Ionicons name="heart-outline" size={18} color="#0F172A" />
              <Text className="text-xs font-semibold text-slate-700">120</Text>
            </Pressable>
            <Pressable className="flex-row items-center gap-1 active:opacity-80">
              <Ionicons name="chatbubble-outline" size={18} color="#0F172A" />
              <Text className="text-xs font-semibold text-slate-700">32</Text>
            </Pressable>
          </View>
        </View>
        <Text className="text-sm text-slate-600">{item.title}</Text>
      </View>
    </Pressable>
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

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <View
      className="rounded-full px-3 py-1"
      style={{ backgroundColor: `${color}1A` }}
    >
      <Text
        className="text-[12px] font-semibold"
        style={{ color }}
      >
        {label}
      </Text>
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

const chipStyle = {
  paddingHorizontal: 14,
  paddingVertical: 8,
  minHeight: 36,
};

type ChangeLocationSheetProps = {
  visible: boolean;
  locationText: string;
  radius: string;
  onChangeLocation: (value: string) => void;
  onChangeRadius: (value: string) => void;
  showRadiusOptions: boolean;
  setShowRadiusOptions: (v: boolean) => void;
  onClose: () => void;
  onApply: () => void;
};

function ChangeLocationSheet({
  visible,
  locationText,
  radius,
  onChangeLocation,
  onChangeRadius,
  showRadiusOptions,
  setShowRadiusOptions,
  onClose,
  onApply,
}: ChangeLocationSheetProps) {
  if (!visible) return null;

  const slide = new Animated.Value(1);
  Animated.timing(slide, {
    toValue: 0,
    duration: 220,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  }).start();

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/35 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          className="bg-white rounded-t-[28px] px-5 pt-4 pb-6"
          style={{
            transform: [{ translateY }],
          }}
        >
          <View className="items-center mb-4">
            <View className="w-16 h-1.5 rounded-full bg-slate-200" />
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-semibold text-slate-900">
              Change Location
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>

          <View className="mb-3">
            <Text className="text-xs font-semibold text-slate-600 mb-2">
              LOCATION
            </Text>
            <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 bg-white">
              <Ionicons name="location-outline" size={18} color="#0F172A"/>
              <TextInput
                placeholder="Search location"
                value={locationText}
                onChangeText={onChangeLocation}
                className="flex-1 text-slate-900 "
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-slate-600 mb-2">
              RADIUS
            </Text>
            <Pressable
              className="flex-row items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 bg-white"
              onPress={() => setShowRadiusOptions(!showRadiusOptions)}
            >
              <Text className="text-base text-slate-900">{radius}</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#0F172A" />
            </Pressable>
            {showRadiusOptions ? (
              <View className="mt-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {["1 mile", "5 miles", "10 miles", "25 miles"].map((opt) => (
                  <Pressable
                    key={opt}
                    className="px-4 py-3 active:bg-slate-50"
                    onPress={() => {
                      onChangeRadius(opt);
                      setShowRadiusOptions(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        radius === opt
                          ? "text-slate-900 font-semibold"
                          : "text-slate-700"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={onApply}
            className="mt-auto rounded-full bg-[#0B73FF] py-4 items-center"
          >
            <Text className="text-base font-semibold text-white">Apply</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

const cardContainer = {
  borderRadius: 28,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  overflow: "hidden" as const,
};
    

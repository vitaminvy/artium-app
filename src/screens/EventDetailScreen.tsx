import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EventHeader from "../domains/events/components/ui/EventHeader";

import EventHeroCard from "../domains/events/components/eventDetail/EventHeroCard";
import OverviewCard from "../domains/events/components/eventDetail/OverviewCard";
import SummaryCard from "../domains/events/components/eventDetail/SummaryCard";
import GuestList from "../domains/events/components/eventDetail/GuestList";
import type { EventItem } from "../domains/discover/types";
import type { EventDetail } from "../domains/events/types";
import { getEventById, fetchEventGuestCounts, fetchEventGuests } from "../domains/discover/services/eventService";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "EventDetail">;
type RsvpStatus = "none" | "going" | "maybe" | "notGoing";

export default function EventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const initialHeaderHeight = Math.max(insets.top + 60, 60);
  const params = route.params as
    | { id?: string; initialRsvp?: RsvpStatus; onRsvpChange?: (status: RsvpStatus) => void; event?: EventItem }
    | undefined;

  const [eventItem, setEventItem] = useState<EventItem | undefined>(undefined);
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [guestCounts, setGuestCounts] = useState<{ going: number; maybe: number; invited: number }>({ going: 0, maybe: 0, invited: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(initialHeaderHeight);
  const currentImageRef = useRef<string>("");

  const fetchDetail = useCallback(
    async (showLoader: boolean) => {
      const eventId = params?.id || params?.event?.id;

      if (!eventId) {
        if (showLoader) setIsLoading(false);
        setLoadError("Missing event id");
        return;
      }

      if (params?.event) {
        setEventItem(params.event);
      }

      try {
        if (showLoader) setIsLoading(true);
        setLoadError(null);

        // Parallel fetch: Event Data, Guest Counts, Guest List (limited)
        const [eventResult, counts, guests] = await Promise.all([
          !params?.event || !params.event.description ? getEventById(eventId) : Promise.resolve(null),
          fetchEventGuestCounts(eventId),
          fetchEventGuests(eventId),
        ]);

        let finalEvent = params?.event;
        let rawData: any = {};

        if (eventResult) {
          finalEvent = eventResult.event;
          rawData = eventResult.raw;
        }

        if (!finalEvent) {
          setLoadError("Event not found");
          if (showLoader) setIsLoading(false);
          return;
        }

        const nextImage = finalEvent.image ?? "";
        if (!nextImage) {
          setHeroImageLoaded(true);
        } else if (currentImageRef.current !== nextImage) {
          setHeroImageLoaded(false);
        }

        setEventItem(finalEvent);
        setGuestCounts(counts);

        const start = finalEvent.datetime ? new Date(finalEvent.datetime) : finalEvent.startDate ? new Date(finalEvent.startDate) : new Date();
        const end = finalEvent.endDatetime ? new Date(finalEvent.endDatetime) : undefined;
        const organizerSnapshot = finalEvent.organizerSnapshot ?? rawData?.organizerSnapshot;

        setDetail({
          id: finalEvent.id,
          overview: {
            location: finalEvent.location ?? "Unknown",
            start: start.toISOString(),
            end: (end ?? start).toISOString(),
            timeZone: finalEvent.timeZone ?? rawData?.timeZone ?? "UTC",
            visibility: finalEvent.visibility ?? rawData?.visibility ?? (finalEvent.locationType === "online" ? "online" : "public"),
            description: rawData?.description ?? (finalEvent as any).description ?? "No description.",
            organizer: {
              name: organizerSnapshot?.name ?? "Organizer",
              handle: organizerSnapshot?.handle,
              avatar: organizerSnapshot?.avatar ?? "",
              verified: organizerSnapshot?.verified ?? false,
            },
          },
          guests: guests,
          exhibitors: [],
        });
      } catch (e: any) {
        console.error(e);
        setLoadError("Failed to load event");
      } finally {
        if (showLoader) setIsLoading(false);
      }
    },
    [params?.event, params?.id]
  );

  useEffect(() => {
    fetchDetail(true);
  }, [fetchDetail]);

  useEffect(() => {
    currentImageRef.current = eventItem?.image ?? "";
  }, [eventItem?.image]);

  const [showGuests, setShowGuests] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>(params?.initialRsvp ?? "none");

  useEffect(() => {
    if (params?.initialRsvp) {
      setRsvpStatus(params.initialRsvp);
    }
  }, [params?.initialRsvp]);

  const handleRsvpChange = useCallback(
    (status: RsvpStatus) => {
      setRsvpStatus(status);
      params?.onRsvpChange?.(status);
      
      // Update local counts optimistically
      fetchEventGuestCounts(eventItem?.id!).then(c => setGuestCounts(c));
    },
    [params?.onRsvpChange, eventItem?.id]
  );

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchDetail(false);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchDetail, isRefreshing]);

  const guestStats = useMemo(() => {
    return [
      { label: "Going", value: guestCounts.going },
      { label: "Maybe", value: guestCounts.maybe },
      { label: "Invited", value: guestCounts.invited },
    ];
  }, [guestCounts]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white">
        <View style={{ zIndex: 2 }}>
          <EventHeader
            title="EVENT DETAIL"
            onPressBack={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate("HomeMain");
            }}
            onLayout={(event) => {
              const nextHeight = event?.nativeEvent?.layout?.height;
              if (nextHeight && nextHeight !== headerHeight) {
                setHeaderHeight(nextHeight);
              }
            }}
          />
        </View>
        <EventDetailSkeleton />
      </View>
    );
  }

  if (!eventItem || loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-white pt-12 px-6">
        <Text className="text-[14px] text-slate-600 text-center">
          {loadError ?? "Event not found"}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View style={{ zIndex: 2 }}>
        <EventHeader
          title="EVENT DETAIL"
          onPressBack={() => {
            if (navigation.canGoBack()) navigation.goBack();
            else navigation.navigate("HomeMain");
          }}
          onLayout={(event) => {
            const nextHeight = event?.nativeEvent?.layout?.height;
            if (nextHeight && nextHeight !== headerHeight) {
              setHeaderHeight(nextHeight);
            }
          }}
        />
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, rowGap: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <EventHeroCard
          event={eventItem}
          initialRsvp={rsvpStatus}
          rsvp={rsvpStatus}
          onChangeRsvp={handleRsvpChange}
          onImageLoad={() => setHeroImageLoaded(true)}
        />

        {detail ? <OverviewCard detail={detail} /> : null}

        <SummaryCard title="Guests" stats={guestStats} onSeeAll={() => setShowGuests(true)} />
      </ScrollView>

      <Modal
        visible={showGuests}
        animationType="slide"
        onRequestClose={() => setShowGuests(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 bg-white"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={60}
        >
          <View
            className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200"
            style={{ paddingTop: insets.top + 4 }}
          >
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              onPress={() => setShowGuests(false)}
            >
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </Pressable>
            <Text className="text-[16px] font-semibold text-slate-900">Guests</Text>
            <View className="h-10 w-10" />
          </View>
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <GuestList guests={detail?.guests ?? []} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {!heroImageLoaded ? (
        <View
          className="absolute left-0 right-0 bottom-0 bg-white"
          style={{ top: headerHeight, zIndex: 1 }}
          pointerEvents="auto"
        >
          <EventDetailSkeleton />
        </View>
      ) : null}
    </View>
  );
}

function EventDetailSkeleton() {
  return (
    <View className="flex-1 bg-white animate-pulse">
      <View className="px-4 pt-4 gap-4">
        <View className="h-56 rounded-3xl bg-slate-200" />
        <View className="rounded-3xl border border-slate-200 bg-white p-5 gap-3">
          <View className="h-4 w-24 rounded bg-slate-200" />
          <View className="h-3 w-40 rounded bg-slate-200" />
          <View className="h-3 w-48 rounded bg-slate-200" />
          <View className="h-3 w-32 rounded bg-slate-200" />
          <View className="mt-2 h-3 w-28 rounded bg-slate-200" />
          <View className="h-3 w-full rounded bg-slate-200" />
          <View className="h-3 w-5/6 rounded bg-slate-200" />
        </View>
        <View className="rounded-3xl border border-slate-200 bg-white p-5 gap-3">
          <View className="h-4 w-20 rounded bg-slate-200" />
          <View className="h-10 rounded-full bg-slate-200" />
          <View className="h-10 rounded-full bg-slate-200" />
          <View className="h-10 rounded-full bg-slate-200" />
        </View>
      </View>
    </View>
  );
}

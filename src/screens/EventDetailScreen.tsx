import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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
import ExhibitorList from "../domains/events/components/eventDetail/ExhibitorList";
import type { EventItem } from "../domains/discover/types";
import type { EventDetail } from "../domains/events/types";
import { getEventById } from "../domains/discover/services/eventService";
import Loader from "../shared/components/Loader";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "EventDetail">;
type RsvpStatus = "none" | "going" | "maybe" | "notGoing";

export default function EventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as
    | { id?: string; initialRsvp?: RsvpStatus; onRsvpChange?: (status: RsvpStatus) => void; event?: EventItem }
    | undefined;

  const [eventItem, setEventItem] = useState<EventItem | undefined>(undefined);
  const [detail, setDetail] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!params?.id) {
        setIsLoading(false);
        if (params?.event) {
          setEventItem(params.event);
        } else {
          setLoadError("Missing event id");
        }
        return;
      }
      if (params?.event) {
        setEventItem(params.event);
      }
      try {
        setIsLoading(true);
        setLoadError(null);
        const result = await getEventById(params.id);
        const { event: data, raw } = result || {};
        if (!data) {
          // fallback to passed param event if available
          if (params?.event) {
            setLoadError(null);
            setIsLoading(false);
            return;
          }
          setLoadError("Event not found");
          setIsLoading(false);
          return;
        }
        const start = data.datetime ? new Date(data.datetime) : data.startDate ? new Date(data.startDate) : new Date();
        const end = data.endDatetime ? new Date(data.endDatetime) : undefined;
        const timeLabel = start.toLocaleString("en-US", {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
      });
        setEventItem({
          ...data,
          datetime: start.toISOString(),
          startDate: start.toISOString(),
          endDatetime: end?.toISOString(),
        timeLabel,
      });
      setDetail({
          id: data.id,
          overview: {
          location: data.location ?? "Unknown",
          start: start.toISOString(),
          end: (end ?? start).toISOString(),
          timeZone: data.timeZone ?? raw?.timeZone ?? "UTC",
          visibility: data.visibility ?? raw?.visibility ?? (data.isOnline ? "online" : "public"),
          description: raw?.description ?? data.description ?? "No description.",
          organizer: {
            name: raw?.organizerSnapshot?.name ?? "Organizer",
            handle: raw?.organizerSnapshot?.handle,
            avatar: raw?.organizerSnapshot?.avatar ?? "",
            verified: raw?.organizerSnapshot?.verified ?? false,
          },
          },
          guests: [],
          exhibitors: [],
      });
      } catch (e: any) {
        setLoadError("Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [params?.id]);

  useEffect(() => {
    if (!isLoading && eventItem && !detail) {
      const start = eventItem.datetime ? new Date(eventItem.datetime) : eventItem.startDate ? new Date(eventItem.startDate) : new Date();
      const end = eventItem.endDatetime ? new Date(eventItem.endDatetime) : undefined;
      setDetail({
        id: eventItem.id,
        overview: {
          location: eventItem.location ?? "Unknown",
          start: start.toISOString(),
          end: (end ?? start).toISOString(),
          timeZone: eventItem.timeZone ?? "UTC",
          visibility: eventItem.visibility ?? (eventItem.isOnline ? "online" : "public"),
          description: (eventItem as any).description ?? "No description.",
          organizer: {
            name: (eventItem as any).organizerSnapshot?.name ?? "Organizer",
            handle: (eventItem as any).organizerSnapshot?.handle,
            avatar: (eventItem as any).organizerSnapshot?.avatar ?? "",
            verified: (eventItem as any).organizerSnapshot?.verified ?? false,
          },
        },
        guests: [],
        exhibitors: [],
      });
    }
  }, [isLoading, eventItem, detail]);

  const [showGuests, setShowGuests] = useState(false);
  const [showExhibitors, setShowExhibitors] = useState(false);
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
    },
    [params?.onRsvpChange]
  );

  const guestStats = useMemo(() => {
    if (!detail) return [];
    return [
      { label: "Going", value: detail.guests.filter((g) => g.status === "going").length },
      { label: "Maybe", value: detail.guests.filter((g) => g.status === "maybe").length },
      { label: "Invited", value: detail.guests.filter((g) => g.status === "invited").length },
    ];
  }, [detail]);

  const exhibitorStats = useMemo(() => {
    if (!detail) return [];
    return [
      {
        label: "Accepted",
        value: detail.exhibitors.filter((e) => e.status === "accepted").length,
      },
      {
        label: "Pending",
        value: detail.exhibitors.filter((e) => e.status === "pending").length,
      },
      {
        label: "Declined",
        value: detail.exhibitors.filter((e) => e.status === "declined").length,
      },
    ];
  }, [detail]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white pt-12">
        <Loader />
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
      <EventHeader
        title="EVENT DETAIL"
        onPressBack={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("HomeMain");
        }}
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ padding: 16, paddingBottom: 32, rowGap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <EventHeroCard
          event={eventItem}
          initialRsvp={rsvpStatus}
          rsvp={rsvpStatus}
          onChangeRsvp={handleRsvpChange}
        />

        {detail ? <OverviewCard detail={detail} /> : null}

        <SummaryCard title="Guests" stats={guestStats} onSeeAll={() => setShowGuests(true)} />

        <SummaryCard
          title="Exhibitors"
          stats={exhibitorStats}
          onSeeAll={() => setShowExhibitors(true)}
        />
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

      <Modal
        visible={showExhibitors}
        animationType="slide"
        onRequestClose={() => setShowExhibitors(false)}
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
              onPress={() => setShowExhibitors(false)}
            >
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </Pressable>
            <Text className="text-[16px] font-semibold text-slate-900">Exhibitors</Text>
            <View className="h-10 w-10" />
          </View>
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <ExhibitorList exhibitors={detail?.exhibitors ?? []} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

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
import { eventDetails } from "../domains/events/mockDetails";
import { eventsMockData } from "../domains/events/mockData";
import type { EventItem } from "../domains/discover/types";
import type { EventDetail } from "../domains/events/types";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "EventDetail">;
type RsvpStatus = "none" | "going" | "maybe" | "notGoing";

export default function EventDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const params = route.params as
    | { id?: string; initialRsvp?: RsvpStatus; onRsvpChange?: (status: RsvpStatus) => void }
    | undefined;

  const detail: EventDetail | undefined = useMemo(() => {
    if (params?.id) {
      return eventDetails.find((item) => item.id === params.id) ?? eventDetails[0];
    }
    return eventDetails[0];
  }, [params]);

  const eventItem: EventItem | undefined = useMemo(() => {
    if (!detail) return undefined;
    const all = [
      ...eventsMockData.discoverEvents,
      ...eventsMockData.hostingEvents,
      ...eventsMockData.yourEvents,
    ];
    return all.find((item) => item.id === detail.id) ?? all[0];
  }, [detail]);

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

  if (!detail || !eventItem) {
    return (
      <View className="flex-1 items-center justify-center bg-white pt-12">
        <Text className="text-[14px] text-slate-600">Event not found</Text>
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

        <OverviewCard detail={detail} />

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
            <GuestList guests={detail.guests} />
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
            <ExhibitorList exhibitors={detail.exhibitors} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

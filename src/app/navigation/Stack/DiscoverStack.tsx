// Stack navigator for Discovery flow
// src/app/navigation/Stack/DiscoverStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "../../../screens/DiscoverScreen";
import ArtworkDetailScreen from "../../../screens/ArtworkDetailScreen";
import CheckoutScreen from "../../../screens/CheckoutScreen";
import UserProfileScreen from "../../../screens/UserProfileScreen";
import FeedDetailScreen from "../../../screens/FeedDetailScreen";
import type { FeedPost } from "../../../domains/feed/types";
import EventDetailScreen from "../../../screens/EventDetailScreen";
import type { ArtworkDetail } from "../../../domains/artwork/types";
import type { EventItem } from "../../../domains/discover/types";

export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  ArtworkDetail: { id: string };
  Checkout: { artwork?: ArtworkDetail };
  UserProfile: { userId: string };
  MomentDetail: { post: FeedPost };
  EventDetail: {
    id?: string;
    initialRsvp?: "none" | "going" | "maybe" | "notGoing";
    onRsvpChange?: (status: "none" | "going" | "maybe" | "notGoing") => void;
    event?: EventItem;
  };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="MomentDetail" component={FeedDetailScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    </Stack.Navigator>
  );
}

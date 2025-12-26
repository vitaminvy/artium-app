// Stack navigator for Discovery flow
// src/app/navigation/Stack/DiscoverStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "../../../screens/DiscoverScreen";
import ArtworkDetailScreen from "../../../screens/ArtworkDetailScreen";
import CheckoutScreen from "../../../screens/CheckoutScreen";
import UserProfileScreen from "../../../screens/UserProfileScreen";
import type { ArtworkDetail } from "../../../domains/artwork/types";

export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  ArtworkDetail: { id: string };
  Checkout: { artwork?: ArtworkDetail };
  UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}

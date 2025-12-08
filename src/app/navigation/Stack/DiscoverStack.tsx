// Stack navigator for Discovery flow
// src/app/navigation/Stack/DiscoverStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "../../../screens/DiscoverScreen";
import ArtworkDetailScreen from "../../../screens/ArtworkDetailScreen";

export type DiscoverStackParamList = {
  DiscoverMain: undefined;
  ArtworkDetail: { id: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
    </Stack.Navigator>
  );
}
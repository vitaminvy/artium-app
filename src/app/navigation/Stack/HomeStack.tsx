// Stack navigator for Home tab and related screens
// src/app/navigation/Stack/HomeStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../../screens/HomeScreen";
import InventoryScreen from "../../../screens/InventoryScreen";
import ArtworkDetailScreen from "../../../screens/ArtworkDetailScreen";

export type HomeStackParamList = {
  HomeMain: undefined;
  Inventory: undefined;
  ArtworkDetail: { id?: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
    </Stack.Navigator>
  );
}

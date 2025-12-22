import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../../../screens/HomeScreen";
import InventoryScreen from "../../../screens/InventoryScreen";
import ArtworkDetailScreen from "../../../screens/ArtworkDetailScreen";
import ProfileScreen from "../../../screens/ProfileScreen";
import EditProfileScreen from "../../../screens/EditProfileScreen";
import CheckoutScreen from "../../../screens/CheckoutScreen";
import type { ArtworkDetail } from "../../../domains/artwork/types";

export type HomeStackParamList = {
  HomeMain: undefined;
  Inventory: undefined;
  ArtworkDetail: { id?: string };
  Profile: undefined;
  EditProfile: undefined;
  Checkout: { artwork?: ArtworkDetail };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="ArtworkDetail" component={ArtworkDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

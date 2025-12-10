import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Text } from "react-native";

import ArtworkDetailScreen from "../../screens/ArtworkDetailScreen";
import LoginScreen from "../../screens/LoginScreen";
import QuickSellScreen from "../../screens/QuickSellScreen";
import TabNavigator from "./TabNavigator";

type RootStackParamList = {
  Tabs: { screen?: string; params?: any } | undefined;
  ArtworkDetail: { id?: string };
  Login: undefined;
  Upload: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Tabs"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArtworkDetail"
          component={ArtworkDetailScreen}
          options={{ title: "Artwork Detail" }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Upload" component={QuickSellScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

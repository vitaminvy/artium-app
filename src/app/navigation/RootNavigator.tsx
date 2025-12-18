import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArtworkDetailScreen from "../../screens/ArtworkDetailScreen";
import QuickSellScreen from "../../screens/QuickSellScreen";
import TabNavigator from "./TabNavigator";
import AuthStack from "./AuthStack";
import { AuthStatus } from "../../domains/auth/types";
import ProfileScreen from "../../screens/ProfileScreen";
import { AppStackParamList } from "./types";
import { navigationRef } from "./navigationRef";

type RootNavigatorProps = {
  authStatus: AuthStatus;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <Stack.Navigator
      id="AppStack"
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ArtworkDetail"
        component={ArtworkDetailScreen}
        options={{ headerShown: true, title: "Artwork Detail" }}
      />
      <Stack.Screen
        name="Upload"
        component={QuickSellScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator({ authStatus }: RootNavigatorProps) {
  return (
    <NavigationContainer ref={navigationRef}>
      {authStatus === "authenticated" ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

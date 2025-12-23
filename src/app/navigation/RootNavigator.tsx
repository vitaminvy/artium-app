import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArtworkDetailScreen from "../../screens/ArtworkDetailScreen";
import UploadInventoryScreen from "../../screens/UploadInventoryScreen";
import CheckoutScreen from "../../screens/CheckoutScreen";
import TabNavigator from "./TabNavigator";
import { TabParamList } from "./tabTypes";
import AuthStack from "./AuthStack";
import { AuthStatus } from "../../domains/auth/types";
import { navigationRef } from "./navigationRef";
import type { ArtworkDetail } from "../../domains/artwork/types";

type AppStackParamList = {
  Tabs: { screen?: keyof TabParamList; params?: TabParamList[keyof TabParamList] } | undefined;
  ArtworkDetail: { id?: string };
  Checkout: { artwork?: ArtworkDetail };
  Upload: undefined;
};

type RootNavigatorProps = {
  authStatus: AuthStatus;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadInventoryScreen}
        options={{ headerShown: false }}
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

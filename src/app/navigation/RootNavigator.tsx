import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArtworkDetailScreen from "../../screens/ArtworkDetailScreen";
import QuickSellScreen from "../../screens/QuickSellScreen";
import TabNavigator from "./TabNavigator";
import AuthStack from "./AuthStack";
import { AuthStatus } from "../../domains/auth/types";

type AppStackParamList = {
  Tabs: { screen?: string; params?: any } | undefined;
  ArtworkDetail: { id?: string };
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
        options={{ title: "Artwork Detail" }}
      />
      <Stack.Screen name="Upload" component={QuickSellScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator({ authStatus }: RootNavigatorProps) {
  return (
    <NavigationContainer>
      {authStatus === "authenticated" ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

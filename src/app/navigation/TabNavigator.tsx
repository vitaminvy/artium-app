// Bottom tab navigator configuration
// src/app/navigation/TabNavigator.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DiscoverStack from "./Stack/DiscoverStack";
import ProfileStack from "./Stack/ProfileStack";
import ChatStack from "./Stack/ChatStack";
import UploadStack from "./Stack/UploadStack";
import HomeScreen from "../../screens/HomeScreen";

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Chat: undefined;
  Upload: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Discover" component={DiscoverStack} />

      <Tab.Screen name="Chat" component={ChatStack} />

      <Tab.Screen name="Upload" component={UploadStack} />

      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

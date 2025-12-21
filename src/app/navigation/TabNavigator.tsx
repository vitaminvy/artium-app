import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DiscoverStack from "./Stack/DiscoverStack";
import FeedStack from "./Stack/FeedStack";
import UploadStack from "./Stack/UploadStack";
import HomeStack from "./Stack/HomeStack";

import CustomTabBar from "./CustomTabBar";
import { TabParamList } from "./tabTypes";
import { TabBarVisibilityProvider } from "./TabBarVisibilityContext";

const Tab = createBottomTabNavigator<TabParamList>();

// Placeholder component for the sheet trigger route
const UploadOptionsPlaceholder = () => null;

export default function TabNavigator() {
  return (
    <TabBarVisibilityProvider>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          lazy: false, // mount tabs eagerly so global sheets can open anywhere
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Feed" component={FeedStack} />

        {/* Center Button (Quick Sell) */}
        <Tab.Screen name="Upload" component={UploadStack} />

        <Tab.Screen name="Discover" component={DiscoverStack} />

        {/* Upload Action Sheet Trigger */}
        <Tab.Screen name="UploadOptions" component={UploadOptionsPlaceholder} />
      </Tab.Navigator>
    </TabBarVisibilityProvider>
  );
}

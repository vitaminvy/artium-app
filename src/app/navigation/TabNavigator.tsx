import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../../screens/HomeScreen";
import FeedScreen from "../../screens/FeedScreen";
import QuickSellScreen from "../../screens/QuickSellScreen";
import DiscoverScreen from "../../screens/DiscoverScreen";
import UploadScreen from "../../screens/UploadScreen";
import CustomTabBar from "./CustomTabBar";
import { TabParamList } from "./tabTypes";

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="QuickSell" component={QuickSellScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
    </Tab.Navigator>
  );
}

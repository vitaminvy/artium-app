// Bottom tab navigator configuration
// src/app/navigation/TabNavigator.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

type TabMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isCenter?: boolean;
};

const TAB_META: Record<keyof TabParamList, TabMeta> = {
  Home: { icon: "home-outline", label: "Home" },
  Chat: { icon: "globe-outline", label: "My Feed" },
  Upload: { icon: "cash-outline", label: "Quick Sell", isCenter: true },
  Discover: { icon: "search-outline", label: "Discover" },
  Profile: { icon: "person-outline", label: "Profile" },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-transparent">
      <View
        className="flex-row items-end bg-white rounded-t-[20px] px-3 pt-1"
        style={[
          containerShadow,
          { paddingBottom: Math.max(insets.bottom, 4) },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const meta = TAB_META[route.name as keyof TabParamList];
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (meta?.isCenter) {
            return (
              <View
                key={route.key}
                className="flex-1 items-center justify-center gap-1.5"
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={onPress}
                  activeOpacity={0.8}
                  className="-mt-5 h-[50px] w-[50px] items-center justify-center rounded-full bg-[#0B73FF]"
                  style={floatingShadow}
                >
                  <Ionicons name={meta.icon} size={22} color="#ffffff" />
                </TouchableOpacity>
                <Text className="text-[12px] font-semibold text-[#0B1224]">
                  {meta.label}
                </Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.9}
              className="flex-1 items-center justify-start gap-[6px]"
            >
              <View
                className="h-[32px] w-[32px] items-center justify-center rounded-xl"
                style={isFocused ? glowShadow : undefined}
              >
                <Ionicons
                  name={meta?.icon ?? "ellipse-outline"}
                  size={22}
                  color={isFocused ? "#0B1224" : "#6B7280"}
                />
              </View>
              <Text
                className={`text-[11px] font-medium ${
                  isFocused ? "text-[#0B1224]" : "text-gray-500"
                }`}
              >
                {meta?.label ?? route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Chat" component={ChatStack} />

      <Tab.Screen name="Upload" component={UploadStack} />

      <Tab.Screen name="Discover" component={DiscoverStack} />

      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

const containerShadow = {
  shadowColor: "#000000",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: -3 },
  shadowRadius: 9,
  elevation: 6,
};

const glowShadow = {
  shadowColor: "#9EF0AE",
  shadowOpacity: 0.85,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
};

const floatingShadow = {
  shadowColor: "#0B73FF",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 8,
};

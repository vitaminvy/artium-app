// Bottom tab navigator configuration
// src/app/navigation/TabNavigator.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Pressable,
  Modal,
  Animated,
  StyleSheet,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DiscoverStack from "./Stack/DiscoverStack";
import FeedStack from "./Stack/FeedStack";
import UploadStack from "./Stack/UploadStack";
import HomeScreen from "../../screens/HomeScreen";

export type TabParamList = {
  Home: undefined;
  Discover: undefined;
  Feed: undefined;
  Upload: undefined;
  UploadOptions: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

type TabMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isCenter?: boolean;
  opensSheet?: boolean;
};

const TAB_META: Record<keyof TabParamList, TabMeta> = {
  Home: { icon: "home-outline", label: "Home" },
  Feed: { icon: "globe-outline", label: "Feed" },
  Upload: { icon: "cash-outline", label: "Quick Sell", isCenter: true },
  Discover: { icon: "search-outline", label: "Discover" },
  UploadOptions: { icon: "add-outline", label: "Upload", opensSheet: true },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showUploadSheet, setShowUploadSheet] = React.useState(false);
  const sheetAnim = React.useRef(new Animated.Value(0)).current;

  const openUploadSheet = () => {
    setShowUploadSheet(true);
    requestAnimationFrame(() => {
      Animated.spring(sheetAnim, {
        toValue: 1,
        useNativeDriver: true,
        damping: 18,
        mass: 0.9,
        stiffness: 200,
      }).start();
    });
  };

  const closeUploadSheet = () => {
    Animated.timing(sheetAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setShowUploadSheet(false));
  };

  const overlayOpacity = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <>
      <View className="bg-transparent">
        <View
          className="flex-row items-end bg-white rounded-t-[20px] px-3 pt-1"
          style={[
            containerShadow,
            { paddingBottom: Math.max(insets.bottom, 2) },
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
              if (meta?.opensSheet) {
                openUploadSheet();
                return;
              }
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
                className="flex-1 items-center justify-start gap-1"
              >
                <View
                  className="h-[32px] w-[32px] items-center justify-center rounded-xl"
                  style={[
                    isFocused ? glowShadow : undefined,
                    isFocused ? activeBubble : undefined,
                  ]}
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

      <Modal
        visible={showUploadSheet}
        transparent
        animationType="none"
        onRequestClose={closeUploadSheet}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0"
            onPress={closeUploadSheet}
            style={StyleSheet.absoluteFill}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0,0,0,0.4)", opacity: overlayOpacity },
              ]}
            />
          </Pressable>

          <Animated.View
            className="w-full px-5 pb-6 pt-3"
            style={{ transform: [{ translateY: cardTranslateY }] }}
          >
            <View className="items-center mb-3">
              <View className="h-1.5 w-16 rounded-full bg-slate-300" />
            </View>

            <View className="rounded-[18px] bg-white shadow-lg">
              {uploadOptions.map((opt, idx) => (
                <Pressable
                  key={opt.title}
                  className={`flex-row items-start gap-3 px-4 py-4 ${
                    idx < uploadOptions.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                  onPress={() => {
                    closeUploadSheet();
                  }}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: opt.tint }}
                  >
                    <Ionicons name={opt.icon} size={22} color={opt.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-slate-900">
                      {opt.title}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {opt.subtitle}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const UploadOptionsPlaceholder = () => null;

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />

      <Tab.Screen name="Feed" component={FeedStack} />

      <Tab.Screen name="Upload" component={UploadStack} />

      <Tab.Screen name="Discover" component={DiscoverStack} />

      <Tab.Screen name="UploadOptions" component={UploadOptionsPlaceholder} />
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

const activeBubble = {
  backgroundColor: "rgba(158, 240, 174, 0.4)",
};

const uploadOptions = [
  {
    title: "Upload inventory",
    subtitle: "Supports GIF, PNG, JPG, JPEG, HEIC",
    icon: "image-outline" as const,
    iconColor: "#0F172A",
    tint: "#E0F2FE",
  },
  {
    title: "Post a Moment",
    subtitle:
      "Videos of your thoughts, moments, or anything you'd like to share.",
    icon: "videocam-outline" as const,
    iconColor: "#0F172A",
    tint: "#E4E9F2",
  },
  {
    title: "Create an Invoice",
    subtitle: "Easily create and send invoices for your artwork sales",
    icon: "document-text-outline" as const,
    iconColor: "#0F172A",
    tint: "#E9D5FF",
  },
];

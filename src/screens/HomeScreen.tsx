// Main Home/Feed Screen
// src/screens/HomeScreen.tsx
import React, { useState } from "react";
import { View, Text, Pressable, Image, DevSettings } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";
import Sidebar from "../shared/components/Sidebar";
import { SidebarKey, useSidebarItems } from "../shared/hooks/useSidebar";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import { tokenStorage } from "../domains/auth/services/tokenStorage";
import { TabParamList } from "../app/navigation/tabTypes";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { navigationRef } from "../app/navigation/navigationRef";

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "HomeMain">,
  BottomTabNavigationProp<TabParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const items = useSidebarItems();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [activeKey, setActiveKey] = useState<SidebarKey>(
    items[0]?.key ?? "home"
  );

  const navigateToProfile = () => {
    navigation.navigate("Profile");
  };

  const goToDiscoverTab = () => {
    // Use root navigation ref to navigate to Discover tab
    if (navigationRef.isReady()) {
      navigationRef.navigate("Discover" as never);
    }
  };

  const handleSidebarSelect = (key: SidebarKey) => {
    setSidebarOpen(false);
    setActiveKey(key);

    if (key === "profile") {
      navigateToProfile();
      return;
    }

    console.log("Selected sidebar item:", key);
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Home"
        badgeLabel="Blog"
        actionType="menu"
        isMenuOpen={sidebarOpen}
        onPressAction={() => setSidebarOpen((prev) => !prev)}
        onHeightChange={(h) => setHeaderHeight(h)}
        underlineSource={UnderlineHome}
      />
      {/* new logo */}
      <View className="flex-1 items-center justify-center px-6">
        <Image
          source={require("../../assets/logos/logo-text-only-light-mode.png")}
          resizeMode="contain"
          style={{ width: 170, height: 64, marginBottom: 10 }}
        />
        <Text className="text-lg text-gray-700">Home Screen</Text>

        <Pressable
          onPress={goToDiscoverTab}
          className="mt-6 px-6 py-3 bg-slate-900 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Discover</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            await tokenStorage.remove();
            DevSettings.reload(); // reload app so auth bootstrap can show Welcome
          }}
          className="mt-4 px-4 py-2 rounded-lg border border-slate-300"
        >
          <Text className="text-slate-700 text-sm">Đăng xuất</Text>
        </Pressable>
      </View>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={items}
      />
    </View>
  );
}

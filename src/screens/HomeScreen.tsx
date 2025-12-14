// Main Home/Feed Screen
// src/screens/HomeScreen.tsx
import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";
import Sidebar from "../shared/components/Sidebar";
import { useSidebarItems } from "../shared/hooks/useSidebar";

export default function HomeScreen() {
  const navigation = useNavigation();
  const items = useSidebarItems();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const activeKey = useMemo(() => items[0]?.key, [items]);

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Home"
        badgeLabel="Blog"
        actionType="menu"
        isMenuOpen={sidebarOpen}
        onPressAction={() => setSidebarOpen((prev) => !prev)}
        onHeightChange={(h) => setHeaderHeight(h)}
        underlineSource={require("../../assets/headers/underline-home.svg")}
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
          onPress={() => navigation.navigate("Discover" as never)}
          className="mt-6 px-6 py-3 bg-slate-900 rounded-xl"
        >
          <Text className="text-white font-semibold">Go to Discover</Text>
        </Pressable>
      </View>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(key) => {
          setSidebarOpen(false);
          console.log("Selected sidebar item:", key);
        }}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={items}
      />
    </View>
  );
}

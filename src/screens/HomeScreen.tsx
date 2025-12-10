// Main Home/Feed Screen
// src/screens/HomeScreen.tsx
import React, { useCallback, useState } from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Sidebar from "../shared/components/Sidebar";
import { SidebarItem, useSidebar } from "../shared/hooks/useSidebar";

const BASE_HEADER_OFFSET = 105;

export default function HomeScreen() {
  const navigation = useNavigation();
  const { isOpen, open, close, handleSelect } = useSidebar();
  const [headerOffset, setHeaderOffset] = useState(BASE_HEADER_OFFSET);

  const handleNavigate = (item: SidebarItem) => {
    if (item === "home") {
      navigation.navigate("Home" as never);
    } else if (item === "profile") {
      navigation.navigate("Profile" as never);
    } else if (item === "sale") {
      // Temp: route to Home until Sale screen is available
      navigation.navigate("Home" as never);
    }
    close();
  };

  const handleHeaderLayout = useCallback(
    (e: any) => {
      const measured =
        e?.nativeEvent?.layout?.y + e?.nativeEvent?.layout?.height + 12 || 0;
      const nextOffset = Math.max(BASE_HEADER_OFFSET, measured);
      if (nextOffset !== headerOffset) {
        setHeaderOffset(nextOffset);
      }
    },
    [headerOffset]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-4">
        <View
          className="flex-row items-center justify-between"
          onLayout={handleHeaderLayout}
        >
          <View>
            <Text className="text-3xl font-extrabold text-slate-900">HOME</Text>
            <View className="mt-1 h-1 w-14 rounded-full bg-lime-400" />
          </View>

          <Pressable
            onPress={isOpen ? close : open}
            className="h-11 w-11 items-center justify-center rounded-full bg-slate-100"
            accessibilityLabel={isOpen ? "Close menu" : "Open menu"}
          >
            <Ionicons
              name={isOpen ? "close-outline" : "menu-outline"}
              size={26}
              color="#0f172a"
            />
          </Pressable>
        </View>

        <View className="mt-10 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10">
          <Text className="text-2xl font-bold text-slate-800">ARTIUM</Text>
          <Text className="mt-2 text-base text-slate-600">
            Home Screen (demo content)
          </Text>

          <Pressable
            onPress={() => navigation.navigate("Discover" as never)}
            className="mt-6 rounded-full bg-blue-500 px-6 py-3"
          >
            <Text className="text-white font-semibold">Go to Discover</Text>
          </Pressable>
        </View>
      </View>

      <Sidebar
        visible={isOpen}
        onClose={close}
        topOffset={headerOffset}
        onSelect={(item) => handleSelect(item, handleNavigate)}
      />
    </SafeAreaView>
  );
}

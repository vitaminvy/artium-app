import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CompositeNavigationProp } from "@react-navigation/native";
import ScreenHeader from "../shared/components/ScreenHeader";
import Sidebar from "../shared/components/Sidebar";
import { SidebarKey, useSidebarItems } from "../shared/hooks/useSidebar";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import { TabParamList } from "../app/navigation/tabTypes";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { useHome } from "../domains/home/hooks/useHome";
import HomeNewsCarousel from "../domains/home/components/cards/HomeNewsCarousel";
import HomeBlogCard from "../domains/home/components/cards/HomeBlogCard";
import HomeEventCard from "../domains/home/components/cards/HomeEventCard";
import HomeSellCard from "../domains/home/components/cards/HomeSellCard";
import HomeFollowingCard from "../domains/home/components/cards/HomeFollowingCard";
import {
  HomeFollowingProfile,
  HomeSellItem,
  HomeBlogItem,
  HomeEventItem,
} from "../domains/home/types";

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "HomeMain">,
  BottomTabNavigationProp<TabParamList>
>;
export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const items = useSidebarItems();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [activeKey, setActiveKey] = useState<SidebarKey>("home");
  const { width } = useWindowDimensions();
  const { news, blogs, events, sellItems, following } = useHome();
  const highlightCardWidth = Math.min(320, Math.round(width * 0.72));
  const highlightCardHeight = Math.round(highlightCardWidth * 0.55);
  const highlights = useMemo(() => {
    const result: HighlightItem[] = [];
    const max = Math.max(blogs.length, events.length);
    for (let i = 0; i < max; i += 1) {
      if (blogs[i]) result.push({ type: "blog", item: blogs[i] });
      if (events[i]) result.push({ type: "event", item: events[i] });
    }
    return result;
  }, [blogs, events]);

  const handleSidebarSelect = (key: SidebarKey | "more") => {
    setSidebarOpen(false);

    if (key === "more") {
      console.log("Sidebar selected:", key);
      return;
    }

    if (key === "inventory") {
      navigation.navigate("Inventory");
      return;
    }

    if (key === "profile") {
      navigation.navigate("Profile");
      return;
    }

    console.log("Sidebar selected:", key);
  };

  useFocusEffect(
    useCallback(() => {
      setActiveKey("home");
    }, [setActiveKey])
  );

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View className="px-4 pt-4">
          <HomeNewsCarousel data={news} />
        </View>

        <View className="mt-4">
          <FlatList
            data={highlights}
            horizontal
            keyExtractor={(item) => item.item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 4,
            }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) =>
              item.type === "blog" ? (
                <HomeBlogCard
                  item={item.item}
                  width={highlightCardWidth}
                  height={highlightCardHeight}
                />
              ) : (
                <HomeEventCard
                  item={item.item}
                  width={highlightCardWidth}
                  height={highlightCardHeight}
                />
              )
            }
          />
        </View>

        <SectionHeader title="Similar to What You Recently Saved" />
        <FlatList
          data={sellItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: ListRenderItemInfo<HomeSellItem>) => (
            <HomeSellCard item={item} />
          )}
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={gridContent}
          columnWrapperStyle={gridColumns}
        />

        <SectionHeader title="Popular in Your Area" />
        <FlatList
          data={following}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: ListRenderItemInfo<HomeFollowingProfile>) => (
            <HomeFollowingCard item={item} />
          )}
          numColumns={2}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={gridContent}
          columnWrapperStyle={gridColumns}
        />
      </ScrollView>

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

type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

type HighlightItem =
  | { type: "blog"; item: HomeBlogItem }
  | { type: "event"; item: HomeEventItem };

function SectionHeader({
  title,
  actionLabel = "SEE ALL",
  onPressAction,
}: SectionHeaderProps) {
  return (
    <View className="mt-6 px-4 mb-3 flex-row items-center justify-between">
      <Text className="text-[18px] font-semibold text-slate-900">
        {title}
      </Text>
      <Pressable onPress={onPressAction}>
        <Text className="text-[12px] font-semibold text-[#2D74ED]">
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

const gridContent = {
  paddingHorizontal: 16,
  rowGap: 12,
};

const gridColumns = {
  columnGap: 12,
};

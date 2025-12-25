import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ScreenHeader from "../shared/components/ScreenHeader";
import Sidebar from "../shared/components/Sidebar";
import { SidebarKey, useSidebarItems } from "../shared/hooks/useSidebar";
import { useBlogData } from "../domains/blog/hooks/useBlogData";
import BlogHeroCarousel from "../domains/blog/components/BlogHeroCarousel";
import BlogHorizontalCard from "../domains/blog/components/BlogHorizontalCard";
import BlogArticleCard from "../domains/blog/components/BlogArticleCard";
import Loader from "../shared/components/Loader";
import type { BlogArticle } from "../domains/blog/types";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";

type BlogScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function BlogScreen() {
  const navigation = useNavigation<BlogScreenNavigationProp>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(92);
  const [activeKey, setActiveKey] = useState<SidebarKey>("home");
  const sidebarItems = useSidebarItems();
  const { data, isLoading, error, refresh } = useBlogData();
  const isInitialLoading = isLoading && !data;
  const isRefreshing = isLoading && !!data;
  const sectionSpacing = 22;

  const latest = useMemo(() => data?.latest ?? [], [data]);
  const popular = useMemo(() => data?.popular ?? [], [data]);
  const featured = useMemo(() => data?.featured ?? [], [data]);
  const allArticles = useMemo(() => data?.all ?? [], [data]);

  useFocusEffect(
    useCallback(() => {
      setActiveKey("home");
    }, [])
  );

  const handleSidebarSelect = (key: SidebarKey | "more") => {
    setSidebarOpen(false);

    if (key === "inventory") {
      navigation.navigate("Inventory");
      return;
    }

    if (key === "profile") {
      navigation.navigate("Profile");
      return;
    }
  };

  const handleOpenArticle = (article: BlogArticle) => {
    navigation.navigate("BlogDetail", { blogId: article.id });
  };

  const showEmpty = !isInitialLoading && !error && !featured.length && !latest.length && !popular.length && !allArticles.length;

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Blog"
        actionType="menu"
        isMenuOpen={sidebarOpen}
        onPressAction={() => setSidebarOpen((prev) => !prev)}
        showBadge={false}
        onHeightChange={(h) => setHeaderHeight(h)}
      />

      {isInitialLoading ? (
        <View className="flex-1 items-center justify-center">
          <Loader />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base font-semibold text-red-500">Could not load blogs. Please try again.</Text>
        </View>
      ) : showEmpty ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-slate-500">No articles yet. Please check back soon.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
          }
          contentContainerStyle={{ paddingBottom: 48 }}
        >
          <View className="px-4 pt-4">
            <BlogHeroCarousel data={featured} onPressItem={handleOpenArticle} />
          </View>

          <SectionHeader title="Latest" subtitle="Fresh drops" topSpacing={sectionSpacing} />
          <HorizontalScroller
            data={latest}
            renderItem={(item) => (
              <BlogHorizontalCard
                key={item.id}
                item={item}
                onPress={handleOpenArticle}
              />
            )}
          />

          <SectionHeader title="Popular" subtitle="Readers' picks" topSpacing={sectionSpacing} />
          <HorizontalScroller
            data={popular}
            renderItem={(item) => (
              <BlogHorizontalCard
                key={item.id}
                item={item}
                onPress={handleOpenArticle}
              />
            )}
          />

          <SectionHeader title="All Articles" subtitle="Everything in one place" topSpacing={sectionSpacing} />
          <View className="px-4 pt-4">
            {allArticles.map((article) => (
              <BlogArticleCard
                key={article.id}
                item={article}
                onPress={handleOpenArticle}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={sidebarItems}
      />
    </View>
  );
}

function SectionHeader({ title, subtitle, topSpacing = 0 }: { title: string; subtitle?: string; topSpacing?: number }) {
  return (
    <View className="px-4 flex-row items-center justify-between" style={{ marginTop: topSpacing }}>
      <View>
        <Text className="text-[18px] font-semibold text-slate-900">{title}</Text>
        {subtitle ? (
          <Text className="text-[12px] text-slate-500 mt-1">{subtitle}</Text>
        ) : null}
      </View>
      <View className="h-[1px] flex-1 ml-3 rounded-full bg-slate-100" />
    </View>
  );
}

function HorizontalScroller({
  data,
  renderItem,
}: {
  data: BlogArticle[];
  renderItem: (item: BlogArticle) => React.ReactNode;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}
    >
      {data.map(renderItem)}
    </ScrollView>
  );
}

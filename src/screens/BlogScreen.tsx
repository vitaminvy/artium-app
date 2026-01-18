import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useNavigation, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import Sidebar from "../shared/components/Sidebar";
import {
  SidebarActionKey,
  SidebarKey,
  useSidebarItems,
} from "../shared/hooks/useSidebar";
import { useBlogData } from "../domains/blog/hooks/useBlogData";
import BlogHeroCarousel from "../domains/blog/components/BlogHeroCarousel";
import BlogHorizontalCard from "../domains/blog/components/BlogHorizontalCard";
import BlogArticleCard from "../domains/blog/components/BlogArticleCard";
import Loader from "../shared/components/Loader";
import UnderlineHome from "../../assets/headers/underline-home.svg";
import type { BlogArticle } from "../domains/blog/types";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { useLogout } from "../domains/auth/hooks/useLogout";
import { LogoutConfirmModal } from "../domains/auth/components/LogoutConfirmModal";

type BlogScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export default function BlogScreen() {
  const navigation = useNavigation<BlogScreenNavigationProp>();

  // Determine which tab we're in by getting parent navigator
  const getActiveTab = useCallback(() => {
    try {
      // Navigate up the hierarchy to find the tab navigator
      // Structure: BlogScreen -> Stack (Home/Feed/Discover) -> Tab Navigator

      let current: any = navigation;
      let tabNavigator = null;
      let attempts = 0;
      const maxAttempts = 5; // Prevent infinite loop

      // Walk up the navigation tree
      while (attempts < maxAttempts) {
        const parent = current.getParent?.();
        if (!parent) break;

        const state = parent.getState();

        // Check if this is the tab navigator (has Home, Feed, Discover routes)
        if (state?.routeNames?.includes('Home') &&
            state?.routeNames?.includes('Feed') &&
            state?.routeNames?.includes('Discover')) {
          tabNavigator = parent;
          break;
        }

        current = parent;
        attempts++;
      }

      if (!tabNavigator) {
        return null;
      }

      const tabState = tabNavigator.getState();
      const currentRoute = tabState.routes[tabState.index];
      const tabName = currentRoute?.name?.toLowerCase();

      // Only return "home" if we're in Home tab
      if (tabName === "home") return "home";

      // For Feed/Discover, return null so sidebar doesn't highlight
      return null;
    } catch (error) {
      return null;
    }
  }, [navigation]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(92);
  const [activeKey, setActiveKey] = useState<SidebarKey | undefined>(undefined);
  const [visibleAllCount, setVisibleAllCount] = useState(5);
  const [pendingShowMore, setPendingShowMore] = useState(false);
  const sidebarItems = useSidebarItems();
  const {
    logout,
    loading: logoutLoading,
    showConfirmModal,
    onConfirmLogout,
    onCancelLogout,
  } = useLogout();
  const {
    featured,
    latest,
    popular,
    all,
    hasMore,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    refresh,
    loadMore,
  } = useBlogData();
  const isInitialLoading = isLoading && !all.length;
  const sectionSpacing = 22;

  const allArticles = all;
  const displayedAll = allArticles.slice(0, visibleAllCount);

  useFocusEffect(
    useCallback(() => {
      const tab = getActiveTab();
      setActiveKey((tab as SidebarKey) || undefined);
    }, [getActiveTab])
  );

  useEffect(() => {
    setVisibleAllCount((prev) => Math.max(5, Math.min(allArticles.length, prev)));
  }, [allArticles]);

  useEffect(() => {
    if (!pendingShowMore || isLoadingMore) return;
    setVisibleAllCount((prev) => Math.min(prev + 5, allArticles.length));
    setPendingShowMore(false);
  }, [pendingShowMore, isLoadingMore, allArticles.length]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("HomeMain");
    }
  }, [navigation]);

  const handleSidebarSelect = (key: SidebarActionKey) => {
    setSidebarOpen(false);

    if (key === "logout") {
      logout();
      return;
    }

    if (key === "notifications") {
      navigation.navigate("Notifications" as never);
      return;
    }

    if (key === "messages") {
      navigation.navigate("Inbox" as never);
      return;
    }

    // Get current tab to determine navigation strategy
    const currentTabName = getActiveTab();

    // If we're in Feed or Discover stack, need to navigate to Home first
    if (currentTabName !== "home") {
      // Find the tab navigator by walking up the tree
      let current: any = navigation;
      let tabNav = null;

      while (current) {
        const parent = current.getParent?.();
        if (!parent) break;

        const state = parent.getState();
        // Check if this parent has Home, Feed, Discover routes (it's the tab navigator)
        if (state?.routeNames?.includes('Home') &&
            state?.routeNames?.includes('Feed') &&
            state?.routeNames?.includes('Discover')) {
          tabNav = parent;
          break;
        }
        current = parent;
      }

      if (tabNav) {
        // Use CommonActions to navigate to nested screens in different tab
        if (key === "inventory") {
          tabNav.dispatch(
            CommonActions.navigate({
              name: "Home",
              params: { screen: "Inventory" },
            })
          );
          return;
        }

        if (key === "profile") {
          tabNav.dispatch(
            CommonActions.navigate({
              name: "Home",
              params: { screen: "Profile" },
            })
          );
          return;
        }

        if (key === "events") {
          tabNav.dispatch(
            CommonActions.navigate({
              name: "Home",
              params: { screen: "Events" },
            })
          );
          return;
        }

        if (key === "home") {
          tabNav.dispatch(
            CommonActions.navigate({
              name: "Home",
              params: { screen: "HomeMain" },
            })
          );
          return;
        }
      }
    } else {
      // We're in Home stack, can navigate directly
      if (key === "inventory") {
        navigation.navigate("Inventory");
        return;
      }

      if (key === "profile") {
        navigation.navigate("Profile");
        return;
      }

      if (key === "events") {
        navigation.navigate("Events" as any);
        return;
      }

      if (key === "home") {
        navigation.navigate("HomeMain");
        return;
      }
    }

    if (key === "invoices") {
      navigation.navigate("Invoices");
      return;
    }
  };

  const handleShowMore = useCallback(async () => {
    const nextCount = visibleAllCount + 5;

    if (nextCount <= allArticles.length) {
      setVisibleAllCount(nextCount);
      return;
    }

    if (hasMore && !isLoadingMore) {
      setPendingShowMore(true);
      await loadMore();
    }
  }, [visibleAllCount, allArticles.length, hasMore, isLoadingMore, loadMore]);

  const handleOpenArticle = (article: BlogArticle) => {
    navigation.navigate("BlogDetail", { blogId: article.id });
  };

  const showEmpty = !isInitialLoading && !error && !featured.length && !latest.length && !popular.length && !allArticles.length;

  return (
    <View className="flex-1 bg-white">
      <BlogHeader
        title="Blog"
        underlineSource={UnderlineHome}
        isMenuOpen={sidebarOpen}
        onPressBack={handleBack}
        onPressMenu={() => setSidebarOpen((prev) => !prev)}
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
          contentContainerStyle={{ paddingBottom: 96 }}
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
            {displayedAll.map((article) => (
              <BlogArticleCard
                key={article.id}
                item={article}
                onPress={handleOpenArticle}
              />
            ))}
            {(displayedAll.length < allArticles.length || hasMore) ? (
              <Pressable
                onPress={handleShowMore}
                className="mt-2 mb-4 h-12 rounded-full items-center justify-center border border-slate-200 bg-white active:opacity-90"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="#0F172A" />
                    <Text className="text-[14px] font-semibold text-slate-800">
                      Loading...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-[14px] font-semibold text-slate-800">
                    Show more articles
                  </Text>
                )}
              </Pressable>
            ) : null}
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

      <LogoutConfirmModal
        visible={showConfirmModal}
        onConfirm={onConfirmLogout}
        onCancel={onCancelLogout}
        loading={logoutLoading}
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

function BlogHeader({
  title,
  underlineSource,
  isMenuOpen,
  onPressMenu,
  onPressBack,
  onHeightChange,
}: {
  title: string;
  underlineSource?: React.ComponentType<SvgProps>;
  isMenuOpen?: boolean;
  onPressMenu?: () => void;
  onPressBack: () => void;
  onHeightChange?: (height: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const lastHeight = useRef(0);
  const topPadding = Math.max(insets.top + 6, 24);
  const Underline = underlineSource;

  return (
    <View
      className="bg-white border-b border-slate-100"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (Math.abs(h - lastHeight.current) > 0.5) {
          lastHeight.current = h;
          onHeightChange?.(h);
        }
      }}
    >
      <View className="flex-row items-center px-4 pb-3" style={{ paddingTop: topPadding }}>
        <Pressable
          onPress={onPressBack}
          hitSlop={8}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-[20px] font-extrabold tracking-[0.5px] text-slate-900">
            {title}
          </Text>
          {Underline ? (
            <Underline width={120} height={12} style={{ marginTop: -4 }} />
          ) : (
            <View
              className="mt-1 h-[3px] rounded-full"
              style={{ width: 100, backgroundColor: "#9BE163" }}
            />
          )}
        </View>

        {onPressMenu ? (
          <Pressable
            onPress={onPressMenu}
            hitSlop={8}
            className="h-11 w-11 items-center justify-center rounded-full active:opacity-80"
          >
            <Ionicons
              name={isMenuOpen ? "close-outline" : "menu-outline"}
              size={22}
              color="#0F172A"
            />
          </Pressable>
        ) : (
          <View className="h-11 w-11" />
        )}
      </View>
    </View>
  );
}

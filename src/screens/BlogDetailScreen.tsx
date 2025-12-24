import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator, Pressable, useWindowDimensions } from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { getBlogById } from "../domains/home/services/blogService";
import type { HomeBlogItem } from "../domains/home/types";
import { HOME_COLORS } from "../domains/home/constants";
import Sidebar from "../shared/components/Sidebar";
import { SidebarKey, useSidebarItems } from "../shared/hooks/useSidebar";

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const items = useSidebarItems();

  const [blog, setBlog] = useState<HomeBlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(96);
  const [activeKey, setActiveKey] = useState<SidebarKey>("home");

  const blogId = route.params?.blogId;
  const imageHeight = Math.round(width * 0.6); // 16:9.6 aspect ratio

  const handleSidebarSelect = (key: SidebarKey | "more") => {
    setSidebarOpen(false);

    if (key === "more") {
      console.log("Sidebar selected:", key);
      return;
    }

    if (key === "inventory") {
      navigation.navigate("Inventory" as never);
      return;
    }

    if (key === "profile") {
      navigation.navigate("Profile" as never);
      return;
    }

    console.log("Sidebar selected:", key);
  };

  useFocusEffect(
    useCallback(() => {
      setActiveKey("home");
    }, [])
  );

  useEffect(() => {
    if (!blogId) {
      setError("No blog ID provided.");
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const blogData = await getBlogById(blogId);
        if (blogData) {
          setBlog(blogData);
        } else {
          setError("Blog post not found.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-white"><ActivityIndicator size="large" color={HOME_COLORS.TEXT_PRIMARY} /></View>;
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-red-500 text-center">{error}</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-blue-500">Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  if (!blog) {
    return null; // Or a "Not Found" component
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with back button and menu */}
      <View
        className="bg-white border-b border-slate-100 px-4"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          setHeaderHeight(h);
        }}
      >
        <View className="relative flex-row items-center justify-between">
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </Pressable>

          <View className="absolute left-0 right-0 items-center pointer-events-none">
            <Text className="text-lg font-semibold text-slate-900">
              Blog
            </Text>
          </View>

          <Pressable
            onPress={() => setSidebarOpen((prev) => !prev)}
            hitSlop={10}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="menu" size={24} color="#0F172A" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <Image
          source={{ uri: blog.image }}
          style={{ width: "100%", height: imageHeight }}
          contentFit="cover"
        />

        <View className="p-5">
          <Text className="text-2xl font-bold text-slate-900 leading-8">
            {blog.title}
          </Text>

          <View className="flex-row items-center gap-3 mt-4 py-3 border-y border-slate-100">
            <View className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
              {blog.authorAvatar && (
                <Image
                  source={{ uri: blog.authorAvatar }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </View>
            <View>
              <Text className="text-sm font-semibold text-slate-800">{blog.author}</Text>
              <Text className="text-xs text-slate-500 mt-1">{blog.dateLabel}</Text>
            </View>
          </View>

          <View className="mt-5">
            <Text className="text-base text-slate-700 leading-6 tracking-wide">
              {blog.excerpt}
            </Text>
            {/* If a full 'content' field were available, it would be rendered here */}
          </View>
        </View>
      </ScrollView>

      <Sidebar
        items={items}
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
      />
    </View>
  );
}

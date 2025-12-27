import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { formatPublishedDate, getBlogById as getBlogArticleById } from "../domains/blog/services/blogService";
import type { BlogArticleWithMeta } from "../domains/blog/types";
import { getBlogById as getHomeBlogById } from "../domains/home/services/blogService";
import type { HomeBlogItem } from "../domains/home/types";
import { HOME_COLORS } from "../domains/home/constants";

export default function BlogDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const [article, setArticle] = useState<BlogArticleWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const blogId = route.params?.blogId;
  const heroHeight = Math.round(width * 1.05);

  useFocusEffect(
    useCallback(() => {
      // no-op for now
    }, [])
  );

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        setError("No blog ID provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const mockArticle = await getBlogArticleById(blogId);
        if (mockArticle) {
          setArticle(mockArticle);
          return;
        }

        const fallback = await getHomeBlogById(blogId);
        if (fallback) {
          setArticle(mapHomeBlogToArticle(fallback));
          return;
        }

        setError("Blog post not found.");
      } catch (err: any) {
        setError(err?.message ?? "An error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={HOME_COLORS.TEXT_PRIMARY} />
      </View>
    );
  }

  if (error || !article) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-base font-semibold text-red-500">
          {error ?? "Unable to load this blog post."}
        </Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-[15px] font-semibold text-blue-500">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View className="relative">
          <Image
            source={{ uri: article.coverImage }}
            style={{ width: "100%", height: heroHeight }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
          />
          <View className="absolute inset-0 bg-black/20" />
          <View
            className="absolute bottom-0 left-0 right-0 h-40"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          />

          <View
            className="absolute left-0 right-0"
            style={{ paddingTop: insets.top + 10 }}
          >
            <View className="flex-row items-center justify-between px-4">
              <CircleButton icon="arrow-back" onPress={() => navigation.goBack()} />
              <Text className="text-[17px] font-bold text-white/95">Blog</Text>
              <View style={{ width: 44 }} />
            </View>
          </View>

          <View className="absolute inset-x-5 bottom-6">
            <View className="rounded-[20px] bg-white/95 p-4 border border-white/80">
              <View className="flex-row items-center gap-2">
                <Pill label={article.tag ?? "Blog"} />
                {article.category ? <Pill label={article.category} muted /> : null}
              </View>

              <Text className="mt-3 text-[22px] font-extrabold leading-7 text-slate-900">
                {article.title}
              </Text>

              <View className="mt-4 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="h-11 w-11 overflow-hidden rounded-full bg-slate-200">
                    <Image
                      source={{ uri: article.authorAvatar }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={0}
                    />
                  </View>
                  <View>
                    <Text className="text-[13px] font-semibold text-slate-900">
                      {article.authorName}
                    </Text>
                    <Text className="text-[12px] text-slate-500">
                      {article.publishedLabel} · {article.readTimeMinutes} mins read
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="px-5 pt-7">
          {article.excerpt ? (
            <Text className="text-[16px] leading-6 text-slate-800">
              {article.excerpt}
            </Text>
          ) : null}

          {article.content?.length ? (
            <View className="mt-5 space-y-4">
              {article.content.map((paragraph, idx) => (
                <Text
                  key={idx}
                  className="text-[15px] leading-6 text-slate-700"
                >
                  {paragraph}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

    </View>
  );
}

function CircleButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full bg-white/85"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      }}
    >
      <Ionicons name={icon} size={20} color="#0F172A" />
    </Pressable>
  );
}

function Pill({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <View
      className="rounded-full px-3 py-[6px]"
      style={{
        backgroundColor: muted ? "rgba(15,23,42,0.06)" : "#0F172A",
      }}
    >
      <Text
        className="text-[11px] font-semibold uppercase tracking-[0.5px]"
        style={{ color: muted ? "#0F172A" : "#FFFFFF" }}
      >
        {label}
      </Text>
    </View>
  );
}

const mapHomeBlogToArticle = (blog: HomeBlogItem): BlogArticleWithMeta => {
  const publishedIso = new Date().toISOString();
  const publishedLabel = blog.dateLabel ?? formatPublishedDate(publishedIso);

  return {
    id: blog.id,
    title: blog.title,
    coverImage: (blog as any).coverImage ?? (blog as any).image ?? "",
    excerpt: blog.excerpt ?? "",
    authorName: blog.author,
    authorAvatar:
      (blog as any).authorAvatar ??
      `https://i.pravatar.cc/150?u=${encodeURIComponent(blog.author)}`,
    publishedAt: publishedIso,
    readTimeMinutes: 5,
    tag: "Blog",
    category: "Editorial",
    content: blog.excerpt ? [blog.excerpt] : [],
    publishedLabel,
  };
};

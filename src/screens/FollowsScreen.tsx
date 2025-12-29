import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, Pressable, TextInput, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useAuth } from "../domains/auth/contexts/AuthContext";
import { fetchFollowers, fetchFollowing } from "../domains/user/services/followService";
import { useFollow } from "../domains/user/hooks/useFollow";

type RouteParams = { type?: "followers" | "following" };
type TabKey = "followers" | "following";

type FollowUser = {
  id: string;
  name: string;
  handle: string;
  avatar?: string | null;
  verified?: boolean;
};

export default function FollowsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const [tab, setTab] = useState<TabKey>(
    (route.params as RouteParams | undefined)?.type ?? "followers"
  );
  const [search, setSearch] = useState("");
  const [followers, setFollowers] = useState<FollowUser[]>([]);
  const [following, setFollowing] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const [f1, f2] = await Promise.all([
          fetchFollowers(currentUser.uid),
          fetchFollowing(currentUser.uid),
        ]);
        setFollowers(f1);
        setFollowing(f2);
      } catch (err) {
        console.warn("Failed to load follow lists", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  const normalizedQuery = search.trim().toLowerCase();
  const filterList = useCallback(
    (list: FollowUser[]) =>
      list.filter((u) => {
        if (!normalizedQuery) return true;
        const haystack = [u.name, u.handle]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    [normalizedQuery]
  );

  const data = useMemo(
    () => (tab === "followers" ? filterList(followers) : filterList(following)),
    [tab, followers, following, filterList]
  );

  const renderItem = ({ item }: { item: FollowUser }) => (
    <FollowRow user={item} currentUserId={currentUser?.uid} />
  );

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
        <Text className="ml-3 text-base font-semibold text-slate-900">
          {tab === "followers" ? "Followers" : "Following"}
        </Text>
      </View>

      <View className="flex-row items-center px-4 py-3">
        <Pressable
          onPress={() => setTab("followers")}
          className="flex-1 items-center py-2"
        >
          <Text
            className="text-base font-semibold"
            style={{ color: tab === "followers" ? "#0F172A" : "#94A3B8" }}
          >
            Followers
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab("following")}
          className="flex-1 items-center py-2"
        >
          <Text
            className="text-base font-semibold"
            style={{ color: tab === "following" ? "#0F172A" : "#94A3B8" }}
          >
            Following
          </Text>
        </Pressable>
      </View>

      <View className="px-4 pb-3">
        <View className="flex-row items-center rounded-full border border-slate-200 bg-slate-50 px-3">
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search"
            placeholderTextColor="#94A3B8"
            className="flex-1 px-2 py-2 text-sm text-slate-900"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {search ? (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-slate-500">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom + 40, 80),
            rowGap: 16,
          }}
        />
      )}
    </View>
  );
}

function FollowRow({ user, currentUserId }: { user: FollowUser; currentUserId?: string | null }) {
  const { isFollowing, toggleFollow } = useFollow(currentUserId, user.id);
  return (
    <View className="flex-row items-center">
      <View className="h-12 w-12 rounded-full overflow-hidden bg-slate-200 mr-3">
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={0}
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-slate-300">
            <Text className="text-sm font-semibold text-white">
              {user.name?.charAt(0) ?? "U"}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
            {user.name}
          </Text>
          {user.verified ? (
            <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          ) : null}
        </View>
        <Text className="text-sm text-slate-500" numberOfLines={1}>@{user.handle}</Text>
      </View>
      {currentUserId && currentUserId !== user.id ? (
        <Pressable
          onPress={() => toggleFollow()}
          className="px-3 py-2 rounded-full border border-slate-200 active:opacity-90"
          style={{ backgroundColor: isFollowing ? "#E2E8F0" : "white" }}
        >
          <Text className="text-sm font-semibold" style={{ color: "#0F172A" }}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

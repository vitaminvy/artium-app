import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, RefreshControl } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAuth } from "../domains/auth/contexts/AuthContext";
import { fetchMoodboardItems, type MoodboardItem } from "../domains/artwork/services/moodboardService";
import MasonryLayout from "../shared/components/MasonryLayout";

type RouteParams = {
  id: string;
  ownerId?: string;
  title?: string;
  cover?: string | null;
  ownerName?: string;
};

type MoodboardItemWithId = MoodboardItem & { id: string };

export default function MoodboardDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const params = (route.params as RouteParams | undefined) ?? {};
  const boardId = params.id;
  const ownerId = params.ownerId ?? currentUser?.uid ?? null;
  const boardTitle = params.title || "Moodboard";
  const ownerName = params.ownerName;

  const [items, setItems] = useState<MoodboardItemWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(
    async (isRefresh = false) => {
      if (!boardId || !ownerId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const list = await fetchMoodboardItems(ownerId, boardId);
        setItems(list.map((it, idx) => ({ ...it, id: it.artworkId || String(idx) })));
      } catch (err) {
        console.warn("Failed to load moodboard items", err);
        setItems([]);
      } finally {
        if (isRefresh) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [boardId, ownerId]
  );

  useEffect(() => {
    void loadItems(false);
  }, [loadItems]);

  const handleRefresh = useCallback(() => {
    void loadItems(true);
  }, [loadItems]);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-slate-500">Loading moodboard...</Text>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-slate-500 text-center">
            No items yet. Save artworks into this moodboard to see them here.
          </Text>
        </View>
      );
    }

    return (
      <MasonryLayout
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={(item, index) => <MoodboardItemCard item={item} index={index} />}
        columnGap={12}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 40, 80),
          paddingTop: 12,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
        <View className="ml-3 flex-1">
          <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
            {boardTitle}
          </Text>
          {ownerName ? (
            <Text className="text-xs text-slate-500" numberOfLines={1}>
              by {ownerName}
            </Text>
          ) : null}
        </View>
      </View>

      {renderContent()}
    </View>
  );
}

function MoodboardItemCard({ item, index }: { item: MoodboardItemWithId; index: number }) {
  const height = 180 + (index % 3) * 28;
  return (
    <View
      className="mb-4 rounded-2xl border border-slate-200 overflow-hidden bg-white"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      }}
    >
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={120}
        />
      ) : (
        <View
          style={{
            height,
            backgroundColor: "#E2E8F0",
          }}
        />
      )}
      <View className="p-3">
        <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
          {item.title}
        </Text>
        {item.price ? (
          <Text className="text-xs text-slate-500" numberOfLines={1}>
            {item.price}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

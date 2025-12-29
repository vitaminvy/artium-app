import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useAuth } from "../domains/auth/contexts/AuthContext";
import { fetchMoodboardItems } from "../domains/artwork/services/moodboardService";

type RouteParams = { id: string };

export default function MoodboardDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();

  const boardId = (route.params as RouteParams | undefined)?.id;
  const [items, setItems] = useState<
    Array<{ id: string; title: string; image?: string | null; price?: string | null }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentUser || !boardId) {
        setLoading(false);
        return;
      }
      try {
        const list = await fetchMoodboardItems(currentUser.uid, boardId);
        setItems(list.map((it) => ({ ...it, id: it.artworkId })));
      } catch (err) {
        console.warn("Failed to load moodboard items", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser, boardId]);

  const renderItem = ({ item }: { item: any }) => (
    <View className="mb-4 rounded-2xl border border-slate-200 overflow-hidden bg-white">
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 200 }}
          contentFit="cover"
          transition={0}
          cachePolicy="memory-disk"
        />
      ) : null}
      <View className="p-3">
        <Text className="text-base font-semibold text-slate-900" numberOfLines={1}>
          {item.title}
        </Text>
        {item.price ? <Text className="text-sm text-slate-500">{item.price}</Text> : null}
      </View>
    </View>
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
        <Text className="ml-3 text-base font-semibold text-slate-900" numberOfLines={1}>
          Moodboard
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-slate-500">Loading...</Text>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-slate-500 text-center">No items yet.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom + 40, 80),
          }}
        />
      )}
    </View>
  );
}

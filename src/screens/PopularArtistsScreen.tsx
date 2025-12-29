import React, { useCallback } from "react";
import { FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHome } from "../domains/home/hooks/useHome";
import HomeFollowingCard from "../domains/home/components/cards/HomeFollowingCard";
import { useProfileContext } from "../domains/user/contexts/ProfileContext";
import type { HomeFollowingProfile } from "../domains/home/types";
import { navigateToUserProfile } from "../shared/utils/navigateToUserProfile";

export default function PopularArtistsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { popularArtists } = useHome();
  const { followingIds, toggleFollow } = useProfileContext();
  const cardWidth = Math.round((width - 16 * 2 - 12) / 2);

  const renderItem = useCallback(
    ({ item }: { item: HomeFollowingProfile }) => (
      <View style={{ width: cardWidth, marginBottom: 12 }}>
        <HomeFollowingCard
          item={item}
          isFollowing={followingIds.includes(item.id)}
          onToggleFollow={toggleFollow}
          onPress={() => navigateToUserProfile(item.id)}
        />
      </View>
    ),
    [cardWidth, followingIds, toggleFollow]
  );

  const keyExtractor = useCallback((item: HomeFollowingProfile) => item.id, []);

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
      </View>

      <View className="px-4 pt-3 pb-2">
        <Text className="text-[18px] font-semibold text-slate-900">
          Popular Artists in Your Area
        </Text>
      </View>

      <FlatList
        data={popularArtists}
        keyExtractor={keyExtractor}
        numColumns={2}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        updateCellsBatchingPeriod={50}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
        columnWrapperStyle={{ columnGap: 12 }}
        renderItem={renderItem}
      />
    </View>
  );
}

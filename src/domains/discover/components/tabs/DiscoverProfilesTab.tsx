import React from "react";
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, ActivityIndicator } from "react-native";
import { ArtistProfile } from "../../types";
import ProfileCard from "../cards/ProfileCard";

type Props = {
  data: ArtistProfile[];
  onCardPress?: (item: ArtistProfile) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onEndReached: () => void;
  isFetchingNextPage: boolean;
  isFollowing?: (id: string) => boolean;
  onToggleFollow?: (id: string) => void;
};

export default function DiscoverProfilesTab({
  data,
  onCardPress,
  onScroll,
  onEndReached,
  isFetchingNextPage,
  isFollowing,
  onToggleFollow,
}: Props) {
  const renderItem = ({ item }: ListRenderItemInfo<ArtistProfile>) => (
    <ProfileCard
      item={item}
      onPress={onCardPress ? () => onCardPress(item) : undefined}
      isFollowing={isFollowing ? isFollowing(item.id) : false}
      onToggleFollow={onToggleFollow}
    />
  );

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="large" color="#94A3B8" style={{ marginVertical: 20 }} /> : null}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
        rowGap: 12,
      }}
      columnWrapperStyle={{ columnGap: 12 }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

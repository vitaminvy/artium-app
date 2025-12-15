import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { ArtistProfile } from "../../types";
import ProfileCard from "../cards/ProfileCard";

type Props = {
  data: ArtistProfile[];
};

export default function DiscoverProfilesTab({ data }: Props) {
  const renderItem = ({ item }: ListRenderItemInfo<ArtistProfile>) => (
    <ProfileCard item={item} />
  );

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
        rowGap: 12,
      }}
      columnWrapperStyle={{ columnGap: 12 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

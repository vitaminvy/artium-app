import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Artwork } from "../../types";
import ArtworkCard from "../cards/ArtworkCard";

type Props = {
  data: Artwork[];
};

export default function DiscoverArtworksTab({ data }: Props) {
  const navigation = useNavigation();

  const renderItem = ({ item }: ListRenderItemInfo<Artwork>) => (
    <ArtworkCard
      item={item}
      onPress={() =>
        (navigation.navigate as any)("ArtworkDetail", { id: item.id })
      }
    />
  );

  return (
    <FlatList
      data={data}
      numColumns={2}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 20,
        rowGap: 12,
      }}
      columnWrapperStyle={{ columnGap: 12 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

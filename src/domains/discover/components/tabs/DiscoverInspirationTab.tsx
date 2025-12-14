import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { InspirationArticle } from "../../types";
import InspirationCard from "../cards/InspirationCard";

type Props = {
  data: InspirationArticle[];
};

export default function DiscoverInspirationTab({ data }: Props) {
  const renderItem = ({ item }: ListRenderItemInfo<InspirationArticle>) => (
    <InspirationCard item={item} />
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
        rowGap: 12,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

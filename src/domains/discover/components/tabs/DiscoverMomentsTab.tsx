import React from "react";
import { FlatList, ListRenderItemInfo } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Artwork } from "../../types";
import MomentCard from "../cards/MomentCard";

type Props = {
  data: Artwork[];
};

export default function DiscoverMomentsTab({ data }: Props) {
  const navigation = useNavigation();

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MomentCard
          item={item}
          onPress={() =>
            (navigation.navigate as any)("ArtworkDetail", { id: item.id })
          }
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: 20,
        rowGap: 16,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}

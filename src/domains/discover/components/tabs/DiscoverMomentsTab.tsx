import React from "react";
import { FlatList, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Artwork } from "../../types";
import MomentCard from "../cards/MomentCard";

type Props = {
  data: Artwork[];
  onCardPress?: (item: Artwork) => void;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export default function DiscoverMomentsTab({ data, onCardPress, onScroll }: Props) {
  const navigation = useNavigation();

  return (
    <FlatList
      numColumns={2}
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MomentCard
          item={item}
          onPress={() =>
            onCardPress
              ? onCardPress(item)
              : (navigation.navigate as any)("ArtworkDetail", { id: item.id })
          }
          style={{ flex: 1 }}
        />
      )}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingTop: 12,
        paddingBottom: 120,
        rowGap: 16,
      }}
      columnWrapperStyle={{ gap: 12 }}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
}

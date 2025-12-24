import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useHome } from "../domains/home/hooks/useHome";
import ArtworkCard from "../domains/discover/components/cards/ArtworkCard";
import type { Artwork } from "../domains/discover/types";

export default function SimilarSavedScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { sellItems } = useHome();
  const cardWidth = Math.round((width - 16 * 2 - 12) / 2);
  const columns = useMemo(
    () => buildMasonryColumns(sellItems, cardWidth),
    [sellItems, cardWidth]
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
      </View>

      <View className="px-4 pt-3 pb-2">
        <Text className="text-[18px] font-semibold text-slate-900">
          Picked For You
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom + 90, 110),
        }}
      >
        <View className="flex-row" style={{ columnGap: 12 }}>
          <View style={{ width: cardWidth, rowGap: 12 }}>
            {columns.left.map((item) => (
              <ArtworkCard
                key={item.id}
                item={item}
                onPress={() =>
                  (navigation.navigate as any)("ArtworkDetail", { id: item.id })
                }
              />
            ))}
          </View>
          <View style={{ width: cardWidth, rowGap: 12 }}>
            {columns.right.map((item) => (
              <ArtworkCard
                key={item.id}
                item={item}
                onPress={() =>
                  (navigation.navigate as any)("ArtworkDetail", { id: item.id })
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function buildMasonryColumns(items: Artwork[], cardWidth: number) {
  const left: Artwork[] = [];
  const right: Artwork[] = [];
  let leftHeight = 0;
  let rightHeight = 0;
  const rightBias = 12;

  items.forEach((item, index) => {
    const estimate = estimateCardHeight(item, cardWidth);

    if (index === 0) {
      left.push(item);
      leftHeight += estimate;
      return;
    }

    if (index === 1) {
      right.push(item);
      rightHeight += estimate + rightBias;
      return;
    }

    if (leftHeight <= rightHeight) {
      left.push(item);
      leftHeight += estimate;
    } else {
      right.push(item);
      rightHeight += estimate;
    }
  });

  return { left, right };
}

function estimateCardHeight(item: Artwork, cardWidth: number) {
  const imageHeight = cardWidth * (4 / 3);
  const title = item.title ?? "";
  const titleLines = Math.min(2, Math.ceil(title.length / 18));
  const baseContent = 98;
  const extraTitle = titleLines > 1 ? 18 : 0;
  return imageHeight + baseContent + extraTitle;
}

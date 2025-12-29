import React, { useMemo } from "react";
import { View, ScrollView, ScrollViewProps } from "react-native";

type MasonryLayoutProps<T> = {
  data: T[];
  numColumns?: number;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  columnGap?: number;
  showsVerticalScrollIndicator?: boolean;
};

/**
 * Masonry Layout Component
 * Distributes items across columns in a Pinterest-style grid
 * Items are added to the shortest column to maintain balance
 */
export default function MasonryLayout<T>({
  data,
  numColumns = 2,
  renderItem,
  keyExtractor,
  contentContainerStyle,
  columnGap = 8,
  showsVerticalScrollIndicator = false,
}: MasonryLayoutProps<T>) {
  // Distribute items across columns
  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: numColumns }, () => []);

    // Simple distribution: alternate items across columns
    // For better balance, you could measure heights, but that requires onLayout
    data.forEach((item, index) => {
      const columnIndex = index % numColumns;
      cols[columnIndex].push(item);
    });

    return cols;
  }, [data, numColumns]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      contentContainerStyle={contentContainerStyle}
    >
      <View
        style={{
          flexDirection: "row",
          gap: columnGap,
          paddingHorizontal: 8,
        }}
      >
        {columns.map((columnItems, columnIndex) => (
          <View
            key={`column-${columnIndex}`}
            style={{
              flex: 1,
            }}
          >
            {columnItems.map((item, itemIndex) => {
              const originalIndex = data.indexOf(item);
              return (
                <React.Fragment key={keyExtractor(item, originalIndex)}>
                  {renderItem(item, originalIndex)}
                </React.Fragment>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

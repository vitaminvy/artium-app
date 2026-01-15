import React, { useMemo } from "react";
import { View, FlatList, FlatListProps, NativeScrollEvent, NativeSyntheticEvent } from "react-native";

type MasonryFlatListProps<T> = {
  data: T[];
  numColumns?: number;
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  columnGap?: number;
  contentContainerStyle?: FlatListProps<any>["contentContainerStyle"];
  showsVerticalScrollIndicator?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListFooterComponent?: React.ReactElement | null;
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  scrollEventThrottle?: number;
};

/**
 * Masonry FlatList Component
 * Masonry layout with infinite scroll support
 */
export default function MasonryFlatList<T>({
  data,
  numColumns = 2,
  renderItem,
  keyExtractor,
  columnGap = 8,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListFooterComponent,
  onScroll,
  scrollEventThrottle = 16,
}: MasonryFlatListProps<T>) {
  // Distribute items across columns
  const columns = useMemo(() => {
    const cols: T[][] = Array.from({ length: numColumns }, () => []);

    // Alternate items across columns
    data.forEach((item, index) => {
      const columnIndex = index % numColumns;
      cols[columnIndex].push(item);
    });

    return cols;
  }, [data, numColumns]);

  return (
    <FlatList
      data={[0]} // Single item to trigger the list
      keyExtractor={() => "masonry-container"}
      renderItem={() => (
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
      )}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={ListFooterComponent}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
    />
  );
}

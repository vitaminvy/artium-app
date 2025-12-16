import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Text, Animated, LayoutChangeEvent } from "react-native";
import { FEED_STRINGS } from "../../constants";
import { FeedTab } from "../../types";

type Props = {
  tab: FeedTab;
  onChange: (tab: FeedTab) => void;
};

type TabLayout = { x: number; width: number };

function FeedTabs({ tab, onChange }: Props) {
  const tabs = useMemo(
    () =>
      [
        { key: "explore", label: FEED_STRINGS.TAB_EXPLORE },
        { key: "following", label: FEED_STRINGS.TAB_FOLLOWING },
      ] as const,
    []
  );

  const [layouts, setLayouts] = useState<Partial<Record<FeedTab, TabLayout>>>({});
  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;

  const handleLayout = (key: FeedTab) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const prevItem = prev[key];
      if (prevItem && prevItem.x === x && prevItem.width === width) return prev;
      return { ...prev, [key]: { x, width } };
    });
  };

  useEffect(() => {
    const target = layouts[tab];
    if (!target) return;
    Animated.parallel([
      Animated.timing(indicatorX, {
        toValue: target.x,
        duration: 160,
        easing: undefined,
        useNativeDriver: false,
      }),
      Animated.timing(indicatorW, {
        toValue: target.width,
        duration: 160,
        easing: undefined,
        useNativeDriver: false,
      }),
    ]).start();
  }, [indicatorW, indicatorX, layouts, tab]);

  return (
    <View style={{ position: "relative", paddingBottom: 6, paddingTop: 6 }}>
      <View className="flex-row items-center justify-center gap-8">
        {tabs.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => onChange(item.key)}
              onLayout={handleLayout(item.key)}
              hitSlop={8}
            >
              <Text
                className={`text-base font-semibold ${
                  active ? "text-slate-900" : "text-slate-500"
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Animated.View
        style={{
          position: "absolute",
          height: 2,
          borderRadius: 999,
          backgroundColor: "#0F172A",
          bottom: 0,
          left: 0,
          width: indicatorW,
          transform: [{ translateX: indicatorX }],
        }}
      />
    </View>
  );
}

const areEqual = (prev: Props, next: Props) =>
  prev.tab === next.tab && prev.onChange === next.onChange;

export default React.memo(FeedTabs, areEqual);

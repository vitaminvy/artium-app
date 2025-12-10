import React from "react";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import TabItem from "../shared/components/TabItem";
import { TabIcons } from "../shared/icons/tabIcons";
import { TAB_LABELS, TabRouteName } from "./tabTypes";

const containerShadow = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 12,
};

const quickShadow = {
  shadowColor: "#347CFF",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 14,
};

export default function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 12);

  const quickSellIndex = state.routes.findIndex(
    (route) => route.name === "QuickSell",
  );
  const quickSellRoute =
    quickSellIndex >= 0 ? state.routes[quickSellIndex] : undefined;
  const isQuickSellFocused = quickSellIndex === state.index;

  const handleQuickSellPress = () => {
    if (!quickSellRoute) return;
    const event = navigation.emit({
      type: "tabPress",
      target: quickSellRoute.key,
      canPreventDefault: true,
    });

    if (!isQuickSellFocused && !event.defaultPrevented) {
      navigation.navigate(quickSellRoute.name);
    }
  };

  const handleQuickSellLongPress = () => {
    if (!quickSellRoute) return;
    navigation.emit({
      type: "tabLongPress",
      target: quickSellRoute.key,
    });
  };

  return (
    <View
      className="bg-transparent"
      style={{ paddingBottom: paddingBottom + 4, paddingTop: 6 }}
    >
      <View className="mx-3">
        <View
          className="relative h-[90px] flex-row items-end justify-between rounded-[28px] border border-[#f1f1f1] bg-white px-5 pb-4"
          style={containerShadow}
        >
          {state.routes.map((route, index) => {
            if (route.name === "QuickSell") {
              return <View key={route.key} className="flex-1" />;
            }

            const isFocused = state.index === index;
            const iconConfig = TabIcons[route.name as TabRouteName];
            const label = TAB_LABELS[route.name as TabRouteName];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                label={label}
                icon={isFocused ? iconConfig.active : iconConfig.inactive}
                isActive={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>

        {quickSellRoute ? (
          <View
            className="absolute left-0 right-0 items-center"
            style={{ top: -16, zIndex: 10 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={TAB_LABELS.QuickSell}
              onPress={handleQuickSellPress}
              onLongPress={handleQuickSellLongPress}
              hitSlop={12}
              className="h-16 w-16 items-center justify-center rounded-full bg-[#347CFF]"
              style={{
                ...quickShadow,
                transform: [{ translateY: isQuickSellFocused ? -2 : 0 }],
              }}
            >
              {TabIcons.QuickSell.active}
            </Pressable>
            <Text
              className={`mt-2 text-[13px] ${
                isQuickSellFocused
                  ? "font-semibold text-black"
                  : "font-medium text-[#777777]"
              }`}
            >
              {TAB_LABELS.QuickSell}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

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

const LABEL_TEXT_CLASS = "text-[13px]";
const LIQUID_BG = "rgba(255,255,255,0.92)";


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

  const leftRoutes = quickSellIndex >= 0 ? state.routes.slice(0, quickSellIndex) : state.routes;
  const rightRoutes =
    quickSellIndex >= 0 ? state.routes.slice(quickSellIndex + 1) : [];

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
      className="bg-[#f2f2f5]"
      style={{ paddingBottom: paddingBottom + 6, paddingTop: 10 }}
    >
      <View className="mx-3">
        <View
          className="relative h-[98px] flex-row items-end justify-between overflow-hidden rounded-[28px] border border-white/50 px-6 pb-6"
          style={[containerShadow, { backgroundColor: LIQUID_BG }]}
        >
          <View
            pointerEvents="none"
            className="absolute inset-x-0 top-0 h-[18px] bg-white/65"
          />

          <View className="flex-row items-end gap-1 flex-1">
            {leftRoutes.map((route, index) => {
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
                  labelClassName={LABEL_TEXT_CLASS}
                  containerClassName="px-3 min-w-[80px] flex-none"
                />
              );
            })}
          </View>

          <View className="w-[110px]" />

          <View className="flex-row items-end gap-1 flex-1 justify-end">
            {rightRoutes.map((route, index) => {
              const actualIndex = quickSellIndex + 1 + index;
              const isFocused = state.index === actualIndex;
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
                  labelClassName={LABEL_TEXT_CLASS}
                  containerClassName="px-3 min-w-[80px] flex-none"
                />
              );
            })}
          </View>
        </View>

        {quickSellRoute ? (
          <View
            pointerEvents="box-none"
            className="absolute left-0 right-0 items-center"
            style={{ top: -20, zIndex: 10 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={TAB_LABELS.QuickSell}
              onPress={handleQuickSellPress}
              onLongPress={handleQuickSellLongPress}
              hitSlop={14}
              className="h-[62px] w-[62px] items-center justify-center rounded-full bg-[#347CFF]"
              style={{
                ...quickShadow,
                transform: [{ translateY: isQuickSellFocused ? -2 : 0 }],
              }}
            >
              {TabIcons.QuickSell.active}
            </Pressable>
            <Text
              className={`mt-2 ${LABEL_TEXT_CLASS} ${
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

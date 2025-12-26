import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  type AnimatedStyle,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import {
  SidebarActionKey,
  SidebarChild,
  SidebarItem,
  useSidebarItems,
} from "../hooks/useSidebar";

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (item: SidebarActionKey) => void;
  topOffset?: number;
  activeKey?: SidebarItem["key"];
  items?: SidebarItem[];
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 340);
const ANIMATION_MS = 230;
const FOOTER_HEIGHT = 40;
// Static base style to avoid recreating the object every render
const BASE_PANEL_STYLE: AnimatedStyle<ViewStyle> = {
  transform: [{ translateX: 0 }],
};

export default function Sidebar({
  visible,
  onClose,
  onSelect,
  topOffset,
  activeKey,
  items,
}: SidebarProps) {
  // slide controls horizontal translation; overlay controls backdrop opacity
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  const panelTop = useMemo(
    () =>
      typeof topOffset === "number" ? topOffset : Math.max(insets.top + 64, 80),
    [insets.top, topOffset]
  );
  // render flag avoids keeping the panel in the tree when fully hidden
  const [shouldRender, setShouldRender] = useState(visible);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const slide = useSharedValue(visible ? 0 : 1);
  const overlay = useSharedValue(visible ? 1 : 0);
  const data = items ?? useSidebarItems();

  // Keep render state in sync with visibility, and drive animations
  useEffect(() => {
    if (visible) setShouldRender(true);

    slide.value = withTiming(
      visible ? 0 : 1,
      { duration: ANIMATION_MS },
      (finished) => {
        if (finished && !visible) {
          runOnJS(setShouldRender)(false);
        }
      }
    );
    overlay.value = withTiming(visible ? 1 : 0, { duration: ANIMATION_MS });
  }, [visible, slide, overlay]);

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          slide.value,
          [0, 1],
          [0, PANEL_WIDTH],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(overlay.value, [0, 1], [0, 0.25], Extrapolate.CLAMP),
  }));

  // Expand/collapse a parent item
  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle tap on an item: expand if it has children, otherwise fire onSelect
  const handlePress = (item: SidebarItem) => {
    if (item.children?.length) {
      toggleExpand(item.key);
      return;
    }
    onSelect?.(item.key);
  };

  if (!shouldRender) return null;

  return (
    <View
      className="absolute left-0 right-0 bottom-0 z-50"
      style={{ top: panelTop }}
      pointerEvents="box-none"
    >
      <Animated.View
        className="absolute left-0 right-0 bottom-0 top-0 bg-black"
        style={animatedOverlayStyle}
        pointerEvents={visible ? "auto" : "none"}
      >
        <Pressable
          onPress={onClose}
          className="flex-1"
          accessibilityLabel="Close sidebar overlay"
        />
      </Animated.View>

      <Animated.View
        style={[
          BASE_PANEL_STYLE,
          animatedPanelStyle,
          {
            width: PANEL_WIDTH,
            paddingBottom: bottomInset + FOOTER_HEIGHT + 8,
          },
          panelShadow,
        ]}
        className="absolute right-0 top-0 bottom-0 bg-white px-4 py-6"
      >
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: FOOTER_HEIGHT + 28 + bottomInset,
              gap: 8,
            }}
            style={{
              marginBottom: FOOTER_HEIGHT + bottomInset + 8,
            }}
          >
            {data.map((item) => {
              const expanded = expandedKeys[item.key];
              return (
                <View key={item.key}>
                  <Pressable
                    onPress={() => handlePress(item)}
                    className={`rounded-2xl px-3 py-3 ${
                      activeKey === item.key ? "bg-slate-100" : "bg-white"
                    }`}
                    accessibilityLabel={item.label}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View className="h-10 w-10 rounded-full items-center justify-center bg-slate-50">
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color="#0f172a"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-[17px] font-semibold text-slate-900">
                            {item.label}
                          </Text>
                          {item.subtitle ? (
                            <Text className="text-xs text-slate-400 mt-0.5">
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {item.children?.length ? (
                        <Ionicons
                          name={
                            expanded
                              ? "chevron-up-outline"
                              : "chevron-down-outline"
                          }
                          size={18}
                          color="#0f172a"
                        />
                      ) : item.trailing === "external" ? (
                        <Ionicons
                          name="arrow-forward-outline"
                          size={18}
                          color="#0f172a"
                        />
                      ) : null}
                    </View>
                  </Pressable>

                  {item.children && expanded ? (
                    <View className="ml-14 mt-1 mb-2 space-y-1">
                      {item.children.map((child, idx) => {
                        return (
                          <SidebarChildRow
                            key={child.key}
                            child={child}
                            delay={idx * 70}
                            expanded={expanded}
                            onPress={() => onSelect?.(child.key)}
                          />
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          <View
            className="absolute left-0 right-0 bg-white"
            style={{
              bottom: 0,
              paddingBottom: bottomInset + 8,
              paddingTop: 8,
              borderTopWidth: 1.25,
              borderBottomWidth: 1.25,
              borderColor: "#cbd5e1",
            }}
          >
            <Pressable
              onPress={() => onSelect?.("logout")}
              className="rounded-2xl px-4 py-4 bg-white"
              accessibilityLabel="Log out"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="h-10 w-10 rounded-full items-center justify-center bg-slate-50">
                    <Ionicons
                      name="log-out-outline"
                      size={22}
                      color="#0f172a"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[17px] font-semibold text-slate-900">
                      Log out
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

type ChildRowProps = {
  child: SidebarChild;
  delay: number;
  expanded: boolean;
  onPress: () => void;
};

function SidebarChildRow({ child, delay, expanded, onPress }: ChildRowProps) {
  const value = useSharedValue(0);

  useEffect(() => {
    if (expanded) {
      value.value = withDelay(delay, withTiming(1, { duration: 220 }));
    } else {
      value.value = withTiming(0, { duration: 120 });
    }
  }, [expanded, delay, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: value.value,
    transform: [
      {
        translateY: interpolate(
          value.value,
          [0, 1],
          [10, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        className="rounded-2xl px-3 py-2.5 bg-white"
        accessibilityLabel={child.label}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-slate-900">
              {child.label}
            </Text>
            {child.subtitle ? (
              <Text className="text-xs text-slate-400 mt-0.5">
                {child.subtitle}
              </Text>
            ) : null}
          </View>
          {child.trailing === "external" ? (
            <Ionicons name="arrow-forward-outline" size={16} color="#0f172a" />
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const panelShadow = {
  shadowColor: "#000",
  shadowOffset: { width: -4, height: 0 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 8,
};

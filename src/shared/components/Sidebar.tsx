import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SidebarItem, useSidebarItems } from "../hooks/useSidebar";

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (item: SidebarItem["key"] | "more") => void;
  topOffset?: number;
  activeKey?: SidebarItem["key"];
  items?: SidebarItem[];
};

const PANEL_WIDTH = 320;
const DEFAULT_TOP_OFFSET = 96;
const ANIMATION_MS = 230;
const FOOTER_HEIGHT = 44;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

// Enable layout animation on Android for smoother expand/collapse
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Sidebar({
  visible,
  onClose,
  onSelect,
  topOffset = DEFAULT_TOP_OFFSET,
  activeKey,
  items,
}: SidebarProps) {
  const insets = useSafeAreaInsets();
  const [shouldRender, setShouldRender] = useState(visible);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const slide = useRef(new Animated.Value(visible ? 0 : 1)).current;
  const overlay = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const data = items ?? useSidebarItems();
  const childAnims = useRef<Record<string, Animated.Value[]>>({});

  useEffect(() => {
    if (visible) setShouldRender(true);

    Animated.parallel([
      Animated.timing(slide, {
        toValue: visible ? 0 : 1,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(overlay, {
        toValue: visible ? 1 : 0,
        duration: ANIMATION_MS,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!visible) setShouldRender(false);
    });
  }, [visible, slide, overlay]);

  const panelStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      transform: [
        {
          translateX: slide.interpolate({
            inputRange: [0, 1],
            outputRange: [0, PANEL_WIDTH],
          }),
        },
      ],
    }),
    [slide]
  );

  const overlayStyle = useMemo(
    () => ({
      opacity: overlay.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.25],
      }),
    }),
    [overlay]
  );

  useEffect(() => {
    data.forEach((item) => {
      if (!item.children?.length) return;
      const existing = childAnims.current[item.key] ?? [];
      const values =
        existing.length === item.children.length
          ? existing
          : item.children.map((_, idx) => existing[idx] ?? new Animated.Value(0));
      childAnims.current[item.key] = values;

      if (expandedKeys[item.key]) {
        Animated.stagger(
          70,
          values.map((val) =>
            Animated.timing(val, {
              toValue: 1,
              duration: 220,
              useNativeDriver: true,
            })
          )
        ).start();
      } else {
        values.forEach((val) => val.setValue(0));
      }
    });
  }, [expandedKeys, data]);

  if (!shouldRender) return null;

  const toggleExpand = (key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePress = (item: SidebarItem) => {
    if (item.children?.length) {
      toggleExpand(item.key);
      return;
    }
    onSelect?.(item.key);
  };

  return (
    <View
      className="absolute left-0 right-0 bottom-0 z-50"
      style={{ top: topOffset }}
      pointerEvents="box-none"
    >
      <AnimatedPressable
        onPress={onClose}
        className="absolute left-0 right-0 bottom-0 bg-black"
        style={[{ top: 0 }, overlayStyle]}
        accessibilityLabel="Close sidebar overlay"
      />

      <Animated.View
        style={[
          panelStyle,
          { width: PANEL_WIDTH, paddingBottom: insets.bottom + FOOTER_HEIGHT },
          panelShadow,
        ]}
        className="absolute right-0 top-0 bottom-0 bg-white px-4 py-6"
      >
        <View className="flex-1">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: FOOTER_HEIGHT + 20,
              gap: 8,
            }}
            style={{ marginBottom: FOOTER_HEIGHT }}
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
                        const val =
                          childAnims.current[item.key]?.[idx] ??
                          new Animated.Value(1);
                        const translateY = val.interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        });
                        return (
                          <AnimatedView
                            key={child.key}
                            style={{
                              opacity: val,
                              transform: [{ translateY }],
                            }}
                          >
                            <Pressable
                              onPress={() => onSelect?.(child.key)}
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
                                  <Ionicons
                                    name="arrow-forward-outline"
                                    size={16}
                                    color="#0f172a"
                                  />
                                ) : null}
                              </View>
                            </Pressable>
                          </AnimatedView>
                        );
                      })}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          <View
            className="absolute left-0 right-0 border-t border-slate-200 border-b border-slate-200 bg-white"
            style={{
              bottom: 0,
              paddingBottom: Math.max(insets.bottom - 4, 0),
              paddingTop: 6,
            }}
          >
            <Pressable
              onPress={() => onSelect?.("more")}
              className="rounded-2xl px-3 py-3 bg-white"
              accessibilityLabel="More"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 rounded-full items-center justify-center bg-slate-50">
                  <Ionicons
                    name="ellipsis-vertical"
                    size={18}
                    color="#0f172a"
                  />
                </View>
                <Text className="text-[17px] font-semibold text-slate-900">
                  More
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const panelShadow = {
  shadowColor: "#000",
  shadowOffset: { width: -4, height: 0 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 8,
};

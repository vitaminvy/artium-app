import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SidebarItem } from "../hooks/useSidebar";

type SidebarProps = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (item: SidebarItem) => void;
  topOffset?: number;
};

const PANEL_WIDTH = 320;
const DEFAULT_TOP_OFFSET = 70;

const ITEMS: Array<{ key: SidebarItem; label: string; icon: keyof typeof Ionicons.glyphMap }> =
  [
    { key: "home", label: "Home", icon: "home-outline" },
    { key: "profile", label: "Profile", icon: "person-circle-outline" },
    { key: "sale", label: "Sale", icon: "pricetag-outline" },
  ];

export default function Sidebar({
  visible,
  onClose,
  onSelect,
  topOffset = DEFAULT_TOP_OFFSET,
}: SidebarProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const slide = useRef(new Animated.Value(visible ? 0 : 1)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
    }

    Animated.timing(slide, {
      toValue: visible ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      if (!visible) {
        setShouldRender(false);
      }
    });
  }, [visible, slide]);

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

  if (!shouldRender) return null;

  return (
    <View
      className="absolute left-0 right-0 bottom-0 z-50"
      style={{ top: topOffset }}
    >
      <Pressable
        onPress={onClose}
        className="absolute left-0 right-0 bottom-0 bg-black/30"
        style={{ top: 0 }}
        accessibilityLabel="Close sidebar"
      />

      <Animated.View
        style={[panelStyle, { width: PANEL_WIDTH }]}
        className="absolute right-0 top-0 bottom-0 bg-white px-4 py-6 shadow-2xl"
      >
        <View className="gap-2">
          {ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => onSelect?.(item.key)}
              className={`rounded-2xl px-3 py-3 ${
                item.key === "home" ? "bg-slate-100" : "bg-white"
              }`}
              accessibilityLabel={item.label}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name={item.icon} size={22} color="#0f172a" />
                <Text className="text-lg font-semibold text-slate-900">
                  {item.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

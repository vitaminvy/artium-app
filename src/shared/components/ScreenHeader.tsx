import React, { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { SvgUri } from "react-native-svg";

type HeaderAction = "menu" | "search" | "notifications";

type ScreenHeaderProps = {
  title: string;
  badgeLabel?: string;
  onPressBadge?: () => void;
  actionType?: HeaderAction;
  onPressAction?: () => void;
  accentColor?: string;
  isMenuOpen?: boolean;
  onHeightChange?: (height: number) => void;
  underlineSource?: ImageSourcePropType;
  underlineSize?: { width: number; height: number };
};

const ACTION_ICON: Record<HeaderAction, keyof typeof Ionicons.glyphMap> = {
  menu: "menu-outline",
  search: "search-outline",
  notifications: "notifications-outline",
};

export default function ScreenHeader({
  title,
  badgeLabel = "Blog",
  onPressBadge,
  actionType,
  onPressAction,
  accentColor = "#9BE163",
  isMenuOpen = false,
  onHeightChange,
  underlineSource,
  underlineSize = { width: 130, height: 12 },
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, 18);
  const underlineWidth = Math.min(Math.max(title.length * 7, 46), 120);
  const lastHeight = useRef(0);

  const resolveActionIcon = () => {
    if (actionType === "menu" && isMenuOpen) return "close-outline";
    return actionType ? ACTION_ICON[actionType] : undefined;
  };

  return (
    <View
      className="bg-white border-b border-slate-100"
      onLayout={(e) => {
        const h = e.nativeEvent.layout.height;
        if (Math.abs(h - lastHeight.current) > 0.5) {
          lastHeight.current = h;
          onHeightChange?.(h);
        }
      }}
    >
      <View className="px-5 pb-4" style={{ paddingTop: topPadding }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-extrabold tracking-[1px] text-slate-900">
              {title.toUpperCase()}
            </Text>
            {underlineSource ? (
              <SvgUri
                uri={Image.resolveAssetSource(underlineSource).uri}
                width={underlineSize.width}
                height={underlineSize.height}
                style={{ marginTop: 4 }}
              />
            ) : (
              <View
                className="mt-1 h-[3px] rounded-full"
                style={{ width: underlineWidth, backgroundColor: accentColor }}
              />
            )}
          </View>

          <View className="flex-row items-center" style={{ columnGap: 20 }}>
            <Pressable
              onPress={onPressBadge}
              accessibilityRole="button"
              hitSlop={6}
              className="px-3.5 py-2 rounded-full border border-slate-200 bg-white shadow-[0px_6px_12px_rgba(0,0,0,0.05)]"
            >
              <Text className="text-[13px] font-semibold text-slate-800">
                {badgeLabel}
              </Text>
            </Pressable>

            {actionType ? (
              <Pressable
                onPress={onPressAction}
                accessibilityRole="button"
                hitSlop={8}
                className="h-11 w-11 items-center justify-center rounded-full"
              >
                <Ionicons
                  name={resolveActionIcon()}
                  size={22}
                  color="#0F172A"
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

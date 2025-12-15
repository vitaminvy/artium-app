import React, { useEffect, useRef, useState } from "react";
import { Animated, View, Text, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { TAB_META, TabParamList } from "./tabTypes";
import UploadActionSheet from "./UploadActionSheet";
import { useTabBarVisibility } from "./TabBarVisibilityContext";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;
  const { hidden, setHeight, height } = useTabBarVisibility();

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: hidden ? height + 40 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [hidden, translateY, height]);

  return (
    <>
      <Animated.View
        className="bg-transparent absolute bottom-0 w-full"
        style={{ transform: [{ translateY }] }}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      >
        <View
          className="flex-row items-end bg-white rounded-t-[24px] px-2 pt-2 shadow-sm"
          style={[
            containerShadow,
            { paddingBottom: Math.max(insets.bottom, 8) },
          ]}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const meta = TAB_META[route.name as keyof TabParamList];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (meta?.opensSheet) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Rung mạnh hơn xíu cho nút quan trọng
                setShowUploadSheet(true);
                return;
              }

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Rung nhẹ khi chuyển tab
                navigation.navigate(route.name);
              }
            };

            // Render Center Button (Special Style)
            if (meta?.isCenter) {
              return (
                <View
                  key={route.key}
                  className="flex-1 items-center justify-end z-10"
                  pointerEvents="box-none"
                >
              <TouchableOpacity
                accessibilityRole="button"
                onPress={onPress}
                activeOpacity={0.9}
                className="-mt-12 h-[50px] w-[50px] items-center justify-center rounded-full bg-[#0B73FF]"
                style={floatingShadow}
              >
                <Ionicons name={meta.icon} size={28} color="#ffffff" />
              </TouchableOpacity>
              <Text
                className={`text-[12px] mt-1 ${
                  isFocused
                    ? "font-semibold text-[#0B73FF]"
                    : "font-medium text-slate-400"
                }`}
              >
                {meta.label}
              </Text>
            </View>
          );
        }

            // Render Normal Tab Item
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                activeOpacity={0.7}
                className="flex-1 items-center justify-center py-1"
              >
                <View
                  className={`h-[24px] w-[24px] items-center justify-center rounded-xl transition-all ${
                    isFocused ? "bg-[#E0F2FE]" : "bg-transparent"
                  }`}
                >
                  <Ionicons
                    name={isFocused ? (meta?.icon as any) : meta?.icon}
                    size={24}
                    color={isFocused ? "#0B73FF" : "#94A3B8"}
                  />
                </View>
                <Text
                  className={`text-[10px] font-medium mt-1 ${
                    isFocused ? "text-[#0B73FF]" : "text-slate-400"
                  }`}
                >
                  {meta?.label ?? route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      <UploadActionSheet 
        visible={showUploadSheet} 
        onClose={() => setShowUploadSheet(false)} 
      />
    </>
  );
}

const containerShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 5,
};

const floatingShadow = {
  shadowColor: "#0B73FF",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.35,
  shadowRadius: 12,
  elevation: 8,
};

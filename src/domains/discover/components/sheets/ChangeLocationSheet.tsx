import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Animated,
  Easing,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ChangeLocationSheetProps = {
  visible: boolean;
  locationText: string;
  radius: string;
  onChangeLocation: (value: string) => void;
  onChangeRadius: (value: string) => void;
  showRadiusOptions: boolean;
  setShowRadiusOptions: (v: boolean) => void;
  onClose: () => void;
  onApply: () => void;
};

export default function ChangeLocationSheet({
  visible,
  locationText,
  radius,
  onChangeLocation,
  onChangeRadius,
  showRadiusOptions,
  setShowRadiusOptions,
  onClose,
  onApply,
}: ChangeLocationSheetProps) {
  const slide = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      slide.setValue(1);
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slide.setValue(1);
    }
  }, [visible, slide]);

  const translateY = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/35 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          className="bg-white rounded-t-[28px] px-5 pt-4 pb-6"
          style={{
            transform: [{ translateY }],
          }}
        >
          <View className="items-center mb-4">
            <View className="w-16 h-1.5 rounded-full bg-slate-200" />
          </View>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[18px] font-semibold text-slate-900">
              Change Location
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>

          <View className="mb-3">
            <Text className="text-xs font-semibold text-slate-600 mb-2">
              LOCATION
            </Text>
            <View className="flex-row items-center gap-3 rounded-2xl border border-slate-200 px-3 py-3 bg-white">
              <Ionicons name="location-outline" size={18} color="#0F172A" />
              <TextInput
                placeholder="Search location"
                value={locationText}
                onChangeText={onChangeLocation}
                className="flex-1 text-slate-900"
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                onSubmitEditing={() => Keyboard.dismiss()}
              />
            </View>
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-slate-600 mb-2">
              RADIUS
            </Text>
            <Pressable
              className="flex-row items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 bg-white"
              onPress={() => setShowRadiusOptions(!showRadiusOptions)}
            >
              <Text className="text-base text-slate-900">{radius}</Text>
              <Ionicons name="chevron-down-outline" size={18} color="#0F172A" />
            </Pressable>
            {showRadiusOptions ? (
              <View className="mt-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {["1 mile", "5 miles", "10 miles", "25 miles"].map((opt) => (
                  <Pressable
                    key={opt}
                    className="px-4 py-3 active:bg-slate-50"
                    onPress={() => {
                      onChangeRadius(opt);
                      setShowRadiusOptions(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        radius === opt
                          ? "text-slate-900 font-semibold"
                          : "text-slate-700"
                      }`}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={onApply}
            className="mt-auto rounded-full bg-[#0B73FF] py-4 items-center"
          >
            <Text className="text-base font-semibold text-white">Apply</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

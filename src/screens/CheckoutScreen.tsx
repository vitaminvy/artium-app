import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  ViewStyle,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { fallbackDetail } from "../domains/artwork/mockData";
import type { ArtworkDetail } from "../domains/artwork/types";

import { useCheckoutForm } from "../domains/checkout/hooks/useCheckoutForm";
import { AddressSheet } from "../domains/checkout/components/sheets/AddressSheet";
import { GuaranteeSheet } from "../domains/checkout/components/sheets/GuaranteeSheet";
import { SummaryRow } from "../domains/checkout/components/ui/SummaryRow";
import { useReservationTimer } from "../domains/checkout/hooks/useReservationTimer";

// --- Integration Imports ---
import { useAuth } from "../domains/auth/contexts/AuthContext";
import { createOrder } from "../domains/checkout/services/orderService";

type CheckoutRouteParams = {
  artwork?: ArtworkDetail;
};

const cardShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 4,
};

const bottomBarShadow: ViewStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 8,
};

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { setHidden } = useTabBarVisibility();
  
  // Auth & State
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setHidden(true);
      return () => setHidden(false);
    }, [setHidden])
  );

  const detail: ArtworkDetail =
    (route.params as CheckoutRouteParams | undefined)?.artwork ?? fallbackDetail;
  const artworkImage = detail.images?.[0] ?? fallbackDetail.images[0];

  const {
    deliveryMethod,
    promoCode,
    setPromoCode,
    showExitConfirm,
    setShowExitConfirm,
    currentAddress,
    hasAddress,
    addressTitle,
    addressSheetRef,
    guaranteeSheetRef,
    openAddressSheet,
    openGuaranteeSheet,
    handleSaveAddress,
    handleDeliveryMethodChange,
  } = useCheckoutForm();
  const { remainingSeconds, isExpired } = useReservationTimer(15 * 60);
  const hasAutoExitedRef = useRef(false);

  useEffect(() => {
    if (!isExpired || hasAutoExitedRef.current) return;
    hasAutoExitedRef.current = true;
    navigation.goBack();
  }, [isExpired, navigation]);

  const reservationLabel = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [remainingSeconds]);

  const addressName = [currentAddress.firstName, currentAddress.lastName]
    .filter(Boolean)
    .join(" ");
  const addressLine = [currentAddress.address1, currentAddress.address2]
    .filter(Boolean)
    .join(", ");
  const addressLocation = [
    currentAddress.city,
    currentAddress.state,
    currentAddress.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  // --- Handle Buy Logic ---
  const handleBuy = async () => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please log in to make a purchase.");
      return;
    }

    if (deliveryMethod === "artium" && !hasAddress) {
      Alert.alert("Missing Information", "Please enter a shipping address.");
      openAddressSheet();
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse price from string (e.g. "USD $1,200" -> 1200)
      // This is a temporary parse because UI passes string. 
      // Ideally pass the raw object from previous screen.
      const priceRaw = detail.price || "0";
      const priceNum = parseFloat(priceRaw.replace(/[^0-9.]/g, "")) || 0;
      
      const result = await createOrder({
        buyerId: currentUser.uid,
        artwork: detail,
        deliveryMethod,
        shippingAddress: currentAddress,
        amount: {
          subtotal: priceNum,
          shipping: 0, // TODO: Calculate real shipping
          total: priceNum, // TODO: Add tax/shipping
          currency: "USD",
        },
      });

      if (result.success) {
        Alert.alert("Order Placed!", "Thank you for your purchase.", [
          { 
            text: "OK", 
            onPress: () => {
              // Navigate to Home or Orders list
              navigation.getParent()?.navigate("Home"); 
            }
          }
        ]);
      } else {
        Alert.alert("Purchase Failed", result.error || "Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-[#F1F5F9]">
        {/* Custom Header */}
        <View
          className="bg-white px-4 pb-3 border-b border-slate-100"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => setShowExitConfirm(true)} hitSlop={8}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </Pressable>
            <Text className="text-[18px] font-semibold text-slate-900">
              Checkout
            </Text>
          </View>
        </View>

        {/* Timer Banner */}
        <View className="bg-slate-200 px-4 py-2">
          <Text className="text-sm text-slate-700 text-center">
            Your order is reserved for {reservationLabel} minutes
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 120 + insets.bottom,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery Method Section */}
          <View
            className="rounded-3xl border border-slate-200 bg-white p-4"
            style={cardShadow}
          >
            <Text className="text-[14px] font-semibold text-slate-500">
              DELIVERY METHOD
            </Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => handleDeliveryMethodChange("artium")}
                className={`flex-1 rounded-xl border px-1 py-3 items-center ${deliveryMethod === "artium" ? "border-[#0B73FF] bg-[#EFF6FF]" : "border-slate-200 bg-white"}`}
              >
                <Text
                  className={`text-sm font-semibold ${deliveryMethod === "artium" ? "text-[#0B73FF]" : "text-slate-800"}`}
                >
                  Ship by Artium
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleDeliveryMethodChange("seller")}
                className={`flex-1 rounded-xl border px-1 py-3 items-center ${deliveryMethod === "seller" ? "border-[#0B73FF] bg-[#EFF6FF]" : "border-slate-200 bg-white"}`}
              >
                <Text
                  className={`text-sm font-semibold ${deliveryMethod === "seller" ? "text-[#0B73FF]" : "text-slate-800"}`}
                >
                  Pick up / Ship by seller
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={openAddressSheet}
              className="mt-4 rounded-3xl border border-[#0B73FF] px-4 py-4"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-slate-600 uppercase">
                  {addressTitle}
                </Text>
                <Text className="text-sm font-semibold text-[#0B73FF]">
                  {hasAddress ? "Edit" : "Add"}
                </Text>
              </View>
              {hasAddress ? (
                <View className="mt-3 gap-1">
                  {addressName ? (
                    <Text className="text-sm font-semibold text-slate-900">
                      {addressName}
                    </Text>
                  ) : null}
                  {currentAddress.email ? (
                    <Text className="text-sm text-slate-500">
                      {currentAddress.email}
                    </Text>
                  ) : null}
                  {addressLine ? (
                    <Text className="text-sm text-slate-500">{addressLine}</Text>
                  ) : null}
                  {addressLocation ? (
                    <Text className="text-sm text-slate-500">
                      {addressLocation}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text className="text-sm text-slate-500 mt-3">
                  Add your contact information and shipping address here for
                  delivery purpose.
                </Text>
              )}
            </Pressable>
          </View>

          {/* Guarantee Section */}
          <Pressable
            onPress={openGuaranteeSheet}
            className="rounded-3xl bg-slate-100 border border-slate-200 px-2 py-2 flex-row items-center gap-3"
            style={cardShadow}
          >
            <View className="h-9 w-9 rounded-full bg-[#E0F2FE] items-center justify-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#0B73FF"
              />
            </View>
            <Text className="flex-1 text-[11px] text-slate-700">
              You are protected by Artium Satisfaction Guarantee
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          {/* Order Summary Section */}
          <View
            className="rounded-3xl border border-slate-200 bg-white p-4"
            style={cardShadow}
          >
            <Text className="text-[14px] font-semibold text-slate-500">
              ORDER SUMMARY
            </Text>

            <View className="flex-row items-center gap-3 mt-4">
              <Image
                source={{ uri: artworkImage }}
                className="h-20 w-20 rounded-2xl bg-slate-100"
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={0}
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  {detail.title}
                </Text>
                <Text className="text-sm text-slate-500 mt-1">
                  {detail.artist.name}
                </Text>
              </View>
            </View>

            <View className="mt-5">
              <Text className="text-sm text-slate-600 mb-3">
                Have a promo code?
              </Text>
              <View className="rounded-2xl border border-slate-200 px-4 py-3">
                <TextInput
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholder="Enter code"
                  placeholderTextColor="#94A3B8"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                  style={{ fontSize: 15, color: "#0F172A", padding: 0 }}
                />
              </View>
            </View>

            <View className="mt-5 gap-3">
              <SummaryRow label="Artwork price" value={detail.price} />
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm text-slate-600">Shipping Fee</Text>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color="#94A3B8"
                  />
                </View>
                <Text className="text-sm text-slate-900">-</Text>
              </View>
            </View>

            <View className="mt-4 rounded-2xl bg-amber-50 px-3 py-2 flex-row items-start gap-2">
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <Text className="flex-1 text-xs text-amber-700">
                Complete your address to know the shipping fee
              </Text>
            </View>

            <View className="mt-5 rounded-2xl border border-slate-200 px-4 py-4 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-900">
                Total
              </Text>
              <Text className="text-base font-semibold text-slate-900">-</Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View
          className="absolute left-0 right-0 bottom-0 border-t border-slate-100 bg-white"
          style={[bottomBarShadow, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <View>
              <Text className="text-sm text-slate-500">Total</Text>
              <Text className="text-lg font-semibold text-slate-900">-</Text>
            </View>
            <Pressable 
              onPress={handleBuy}
              disabled={isSubmitting}
              className={`rounded-full px-6 py-3 active:opacity-90 ${isSubmitting ? "bg-slate-300" : "bg-[#0B73FF]"}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">Buy</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Sheets */}
        <AddressSheet
          sheetRef={addressSheetRef}
          initialAddress={currentAddress}
          title={addressTitle}
          onSave={handleSaveAddress}
        />

        <GuaranteeSheet sheetRef={guaranteeSheetRef} />

        {/* Exit Flow Modal */}
        <Modal
          visible={showExitConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExitConfirm(false)}
        >
          <View className="flex-1 bg-black/40 items-center justify-center px-6">
            <View className="w-full rounded-[28px] bg-white p-6">
              <View className="flex-row justify-end">
                <Pressable
                  onPress={() => setShowExitConfirm(false)}
                  hitSlop={12}
                  className="h-10 w-10 items-center justify-center rounded-full"
                >
                  <Ionicons name="close" size={22} color="#0F172A" />
                </Pressable>
              </View>

              <View className="mt-2 mb-5">
                <Text className="text-2xl font-bold text-slate-900 text-center">
                  Are you sure{"\n"}you want to exit?
                </Text>
                <Text className="mt-3 text-base text-slate-500 text-center">
                  If you leave this page, your information won't be saved.
                </Text>
              </View>

              <View className="gap-3">
                <Pressable
                  onPress={() => {
                    setShowExitConfirm(false);
                    navigation.goBack();
                  }}
                  className="rounded-full border border-rose-500 py-3 items-center active:opacity-80"
                >
                  <Text className="text-base font-semibold text-rose-500">
                    Yes, exit flow
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowExitConfirm(false)}
                  className="rounded-full border border-slate-200 py-3 items-center active:opacity-80"
                >
                  <Text className="text-base font-semibold text-slate-700">
                    Cancel
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </BottomSheetModalProvider>
  );
}

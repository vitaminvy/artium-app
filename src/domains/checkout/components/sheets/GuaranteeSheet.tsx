import React, { useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GuaranteeItem } from "../ui/GuaranteeItem";

type Props = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
};

export function GuaranteeSheet({ sheetRef }: Props) {
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["80%"], []);

  const backdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
      />
    ),
    []
  );

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={Math.max(insets.bottom, 16)}>
        <View className="px-6 pb-2 bg-white">
          <Pressable
            onPress={() => sheetRef.current?.dismiss()}
            className="rounded-full border border-slate-200 py-3 items-center active:opacity-80"
          >
            <Text className="text-base font-semibold text-slate-900">
              Close
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [insets.bottom, sheetRef]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      backdropComponent={backdrop}
      handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40 }}
      backgroundStyle={{ backgroundColor: "white" }}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableDynamicSizing={false}
      footerComponent={renderFooter}
    >
      <View className="flex-1">
        <View className="px-6 pt-3 pb-3 border-b border-slate-100 bg-white">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-900">
              Artium satisfaction guarantee
            </Text>
            <Pressable
              onPress={() => sheetRef.current?.dismiss()}
              hitSlop={8}
            >
              <Ionicons name="close-outline" size={26} color="#0F172A" />
            </Pressable>
          </View>
        </View>

        <BottomSheetScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 120,
            gap: 28,
          }}
          showsVerticalScrollIndicator={false}
        >
          <GuaranteeItem
            icon="lock-closed-outline"
            title="100% money-back guarantee"
            description="Return your purchase for any reason within 48 hours after delivery. The buyer is responsible for all return shipping costs. The refund will be in your account 5-7 days after Artium successfully receives the artwork."
          />

          <GuaranteeItem
            icon="car-outline"
            title="Artium offers insured, flat-rate shipping"
            description={
              <Text className="text-sm text-slate-500 leading-5">
                Artium insures your order. If you select ship, shipping fee is
                calculated based on order subtotal (after discounts), and shows
                in the final total at checkout, with a flat fee of 5% for
                domestic, 8% for international. Oversized artworks will incur a
                flat fee of 10% for domestic, 15% for international shipping. If
                you select pick up in-person, it's free. Total at checkout
                excludes local customs duties, taxes, and import fees; your
                carrier may collect these on delivery.{" "}
                <Text className="text-[#0B73FF] font-semibold">Learn more</Text>
              </Text>
            }
          />

          <GuaranteeItem
            icon="shield-checkmark-outline"
            title="Certificate of Authenticity included"
            description="All artworks are authenticated by the Artium team. You will receive a certificate of authenticity from the artist when you purchase a work through Artium."
          />
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

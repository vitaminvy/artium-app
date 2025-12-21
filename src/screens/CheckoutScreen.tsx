import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { fallbackDetail } from "../domains/artwork/mockData";
import type { ArtworkDetail } from "../domains/artwork/types";

type DeliveryMethod = "artium" | "seller";

type AddressForm = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  postalCode: string;
  address1: string;
  address2: string;
  state: string;
  city: string;
  phone: string;
};

type AddressFieldKey =
  | "firstName"
  | "lastName"
  | "email"
  | "country"
  | "postalCode"
  | "address1"
  | "state"
  | "phone";

const REQUIRED_FIELDS: AddressFieldKey[] = [
  "firstName",
  "lastName",
  "email",
  "country",
  "postalCode",
  "address1",
  "state",
  "phone",
];

const FIELD_ORDER: AddressFieldKey[] = [
  "firstName",
  "lastName",
  "email",
  "country",
  "postalCode",
  "address1",
  "state",
  "phone",
];

const createEmptyAddress = (): AddressForm => ({
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  postalCode: "",
  address1: "",
  address2: "",
  state: "",
  city: "",
  phone: "",
});

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

type CheckoutRouteParams = {
  artwork?: ArtworkDetail;
};

export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { setHidden } = useTabBarVisibility();

  useFocusEffect(
    useCallback(() => {
      setHidden(true);
      return () => setHidden(false);
    }, [setHidden])
  );

  const detail: ArtworkDetail =
    (route.params as CheckoutRouteParams | undefined)?.artwork ?? fallbackDetail;

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("artium");
  const [promoCode, setPromoCode] = useState("");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<AddressFieldKey, string>>>(
    {}
  );
  const [scrollToError, setScrollToError] = useState(false);
  const [addressByMethod, setAddressByMethod] = useState<Record<DeliveryMethod, AddressForm>>({
    artium: createEmptyAddress(),
    seller: createEmptyAddress(),
  });
  const [form, setForm] = useState<AddressForm>(createEmptyAddress());

  const sheetRef = useRef<BottomSheetModal>(null);
  const scrollRef = useRef<any>(null);
  const fieldPositions = useRef<Record<AddressFieldKey, number>>(
    {} as Record<AddressFieldKey, number>
  );
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);
  const postalRef = useRef<TextInput>(null);
  const address1Ref = useRef<TextInput>(null);
  const address2Ref = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const snapPoints = useMemo(() => ["90%"], []);

  const currentAddress = addressByMethod[deliveryMethod];
  const hasAddress = Object.values(currentAddress).some((value) => value.trim().length > 0);
  const addressTitle = deliveryMethod === "artium" ? "Shipping Address" : "Pick up / ship address";
  const artworkImage = detail.images?.[0] ?? fallbackDetail.images[0];

  const openAddressSheet = () => {
    setForm(currentAddress);
    setErrors({});
    sheetRef.current?.present();
  };

  const handleSaveAddress = () => {
    const nextErrors: Partial<Record<AddressFieldKey, string>> = {};
    REQUIRED_FIELDS.forEach((key) => {
      if (!form[key].trim()) {
        nextErrors[key] = "This field is required.";
      }
    });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setScrollToError(true);
      return;
    }

    setErrors({});
    setAddressByMethod((prev) => ({
      ...prev,
      [deliveryMethod]: form,
    }));
    sheetRef.current?.dismiss();
  };

  const handleFieldLayout = (key: AddressFieldKey, y: number) => {
    fieldPositions.current[key] = y;
  };

  const handleFormChange = (key: keyof AddressForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => {
        if (!prev[key as AddressFieldKey]) return prev;
        const next = { ...prev };
        delete next[key as AddressFieldKey];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!scrollToError || !scrollRef.current) return;
    const firstKey = FIELD_ORDER.find((key) => errors[key]);
    if (!firstKey) {
      setScrollToError(false);
      return;
    }
    const y = fieldPositions.current[firstKey];
    if (typeof y === "number") {
      scrollRef.current.scrollTo({ y: Math.max(y - 16, 0), animated: true });
    }
    setScrollToError(false);
  }, [errors, scrollToError]);

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

  const addressName = [currentAddress.firstName, currentAddress.lastName]
    .filter(Boolean)
    .join(" ");
  const addressLine = [currentAddress.address1, currentAddress.address2]
    .filter(Boolean)
    .join(", ");
  const addressLocation = [currentAddress.city, currentAddress.state, currentAddress.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <BottomSheetModalProvider>
      <View className="flex-1 bg-[#F1F5F9]">
        <View
          className="bg-white px-4 pb-3 border-b border-slate-100"
          style={{ paddingTop: Math.max(insets.top, 12) }}
        >
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => setShowExitConfirm(true)} hitSlop={8}>
              <Ionicons name="close" size={24} color="#0F172A" />
            </Pressable>
            <Text className="text-[18px] font-semibold text-slate-900">Checkout</Text>
          </View>
        </View>

        <View className="bg-slate-200 px-4 py-2">
          <Text className="text-sm text-slate-700 text-center">
            Your order is reserved for 19:55 minutes
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
          <View className="rounded-3xl border border-slate-200 bg-white p-4" style={cardShadow}>
            <Text className="text-[14px] font-semibold text-slate-500">DELIVERY METHOD</Text>
            <View className="flex-row gap-3 mt-4">
              <Pressable
                onPress={() => {
                  setDeliveryMethod("artium");
                  setErrors({});
                }}
                className={`flex-1 rounded-xl border px-1 py-3 items-center ${
                  deliveryMethod === "artium"
                    ? "border-[#0B73FF] bg-[#EFF6FF]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    deliveryMethod === "artium" ? "text-[#0B73FF]" : "text-slate-800"
                  }`}
                >
                  Ship by Artium
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDeliveryMethod("seller");
                  setErrors({});
                }}
                className={`flex-1 rounded-xl border px-1 py-3 items-center ${
                  deliveryMethod === "seller"
                    ? "border-[#0B73FF] bg-[#EFF6FF]"
                    : "border-slate-200 bg-white"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    deliveryMethod === "seller" ? "text-[#0B73FF]" : "text-slate-800"
                  }`}
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
                    <Text className="text-sm text-slate-500">{currentAddress.email}</Text>
                  ) : null}
                  {addressLine ? (
                    <Text className="text-sm text-slate-500">{addressLine}</Text>
                  ) : null}
                  {addressLocation ? (
                    <Text className="text-sm text-slate-500">{addressLocation}</Text>
                  ) : null}
                </View>
              ) : (
                <Text className="text-sm text-slate-500 mt-3">
                  Add your contact information and shipping address here for delivery purpose.
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable
            className="rounded-3xl bg-slate-100 border border-slate-200 px-2 py-2 flex-row items-center gap-3"
            style={cardShadow}
          >
            <View className="h-9 w-9 rounded-full bg-[#E0F2FE] items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#0B73FF" />
            </View>
            <Text className="flex-1 text-[11px] text-slate-700">
              You are protected by Artium Satisfaction Guarantee
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View className="rounded-3xl border border-slate-200 bg-white p-4" style={cardShadow}>
            <Text className="text-[14px] font-semibold text-slate-500">ORDER SUMMARY</Text>

            <View className="flex-row items-center gap-3 mt-4">
              <Image
                source={{ uri: artworkImage }}
                className="h-20 w-20 rounded-2xl bg-slate-100"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  {detail.title}
                </Text>
                <Text className="text-sm text-slate-500 mt-1">{detail.artist.name}</Text>
              </View>
            </View>

            <View className="mt-5">
              <Text className="text-sm text-slate-600 mb-3">Have a promo code?</Text>
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
                  <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
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
              <Text className="text-base font-semibold text-slate-900">Total</Text>
              <Text className="text-base font-semibold text-slate-900">-</Text>
            </View>
          </View>
        </ScrollView>

        <View
          className="absolute left-0 right-0 bottom-0 border-t border-slate-100 bg-white"
          style={[
            bottomBarShadow,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <View>
              <Text className="text-sm text-slate-500">Total</Text>
              <Text className="text-lg font-semibold text-slate-900">-</Text>
            </View>
            <Pressable className="rounded-full bg-[#0B73FF] px-6 py-3 active:opacity-90">
              <Text className="text-base font-semibold text-white">Buy</Text>
            </Pressable>
          </View>
        </View>

        <BottomSheetModal
          ref={sheetRef}
          snapPoints={snapPoints}
          index={0}
          backdropComponent={backdrop}
          handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40 }}
          backgroundStyle={{ backgroundColor: "white" }}
          enablePanDownToClose
          enableContentPanningGesture={false}
        >
          <View className="flex-1">
            <View className="px-5 pt-2 pb-3 border-b border-slate-100 bg-white">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-slate-900">
                  {addressTitle}
                </Text>
                <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={8}>
                  <Ionicons name="close-outline" size={26} color="#0F172A" />
                </Pressable>
              </View>
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <BottomSheetScrollView
                ref={scrollRef}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: Math.max(insets.bottom, 16) + 32,
                  gap: 18,
                }}
                keyboardShouldPersistTaps="handled"
              >

            <View onLayout={(e) => handleFieldLayout("firstName", e.nativeEvent.layout.y)}>
              <SheetField
                label="First Name"
                required
                inputRef={firstNameRef}
                value={form.firstName}
                onChangeText={(value) => handleFormChange("firstName", value)}
                placeholder="Enter first name"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => lastNameRef.current?.focus()}
                error={errors.firstName}
              />
            </View>
            <View onLayout={(e) => handleFieldLayout("lastName", e.nativeEvent.layout.y)}>
              <SheetField
                label="Last Name"
                required
                inputRef={lastNameRef}
                value={form.lastName}
                onChangeText={(value) => handleFormChange("lastName", value)}
                placeholder="Enter last name"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => emailRef.current?.focus()}
                error={errors.lastName}
              />
            </View>
            <View onLayout={(e) => handleFieldLayout("email", e.nativeEvent.layout.y)}>
              <SheetField
                label="Email Address"
                required
                inputRef={emailRef}
                value={form.email}
                onChangeText={(value) => handleFormChange("email", value)}
                placeholder="example@email.com"
                keyboardType="email-address"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => countryRef.current?.focus()}
                error={errors.email}
              />
            </View>
            <View onLayout={(e) => handleFieldLayout("country", e.nativeEvent.layout.y)}>
              <SheetSelectField
                label="Country"
                required
                inputRef={countryRef}
                value={form.country}
                placeholder="Select Country"
                onChangeText={(value) => handleFormChange("country", value)}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => postalRef.current?.focus()}
                error={errors.country}
              />
            </View>
            <View onLayout={(e) => handleFieldLayout("postalCode", e.nativeEvent.layout.y)}>
              <SheetField
                label="Postal / Zip code"
                required
                inputRef={postalRef}
                value={form.postalCode}
                onChangeText={(value) => handleFormChange("postalCode", value)}
                placeholder="Enter postal code"
                keyboardType="numeric"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => address1Ref.current?.focus()}
                error={errors.postalCode}
              />
            </View>
            <View onLayout={(e) => handleFieldLayout("address1", e.nativeEvent.layout.y)}>
              <SheetField
                label="Address Line 1"
                required
                inputRef={address1Ref}
                value={form.address1}
                onChangeText={(value) => handleFormChange("address1", value)}
                placeholder="Street address"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => address2Ref.current?.focus()}
                error={errors.address1}
              />
            </View>
            <SheetField
              label="Address Line 2"
              inputRef={address2Ref}
              value={form.address2}
              onChangeText={(value) => handleFormChange("address2", value)}
              placeholder="Apt, suite, etc"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => stateRef.current?.focus()}
            />
            <View onLayout={(e) => handleFieldLayout("state", e.nativeEvent.layout.y)}>
              <SheetSelectField
                label="State / District / Province"
                required
                inputRef={stateRef}
                value={form.state}
                placeholder="Select State / District / Province"
                onChangeText={(value) => handleFormChange("state", value)}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => cityRef.current?.focus()}
                error={errors.state}
              />
            </View>
            <SheetSelectField
              label="City"
              inputRef={cityRef}
              value={form.city}
              placeholder="Select City"
              onChangeText={(value) => handleFormChange("city", value)}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <View onLayout={(e) => handleFieldLayout("phone", e.nativeEvent.layout.y)}>
              <SheetField
                label="Phone Number"
                required
                inputRef={phoneRef}
                value={form.phone}
                onChangeText={(value) => handleFormChange("phone", value)}
                placeholder="+1 (123) 456 7890"
                keyboardType="phone-pad"
                helper="We will only use your phone number for delivery purposes."
                returnKeyType="done"
                onSubmitEditing={() => phoneRef.current?.blur()}
                error={errors.phone}
              />
            </View>

            <Pressable
              onPress={handleSaveAddress}
              className="rounded-full bg-[#0B73FF] py-4 items-center active:opacity-90"
            >
              <Text className="text-base font-semibold text-white">Save</Text>
            </Pressable>
              </BottomSheetScrollView>
            </KeyboardAvoidingView>
          </View>
        </BottomSheetModal>

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

type SheetFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  helper?: string;
  inputRef?: React.Ref<TextInput>;
  returnKeyType?: "next" | "done";
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  error?: string;
  onChangeText: (value: string) => void;
};

function SheetField({
  label,
  value,
  placeholder,
  required,
  keyboardType,
  helper,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  error,
  onChangeText,
}: SheetFieldProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-1">
        <Text className="text-[12px] font-semibold text-slate-600 uppercase">{label}</Text>
        {required ? <Text className="text-[12px] font-semibold text-red-500">*</Text> : null}
      </View>
      <View className="rounded-2xl border border-slate-200 px-4 py-3 bg-white">
        <BottomSheetTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          style={{ fontSize: 15, color: "#0F172A", padding: 0 }}
        />
      </View>
      {error ? <Text className="text-[11px] text-rose-500">{error}</Text> : null}
      {helper ? <Text className="text-[11px] text-slate-400">{helper}</Text> : null}
    </View>
  );
}

type SheetSelectFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  inputRef?: React.Ref<TextInput>;
  returnKeyType?: "next" | "done";
  blurOnSubmit?: boolean;
  onSubmitEditing?: () => void;
  error?: string;
  onChangeText: (value: string) => void;
};

function SheetSelectField({
  label,
  value,
  placeholder,
  required,
  inputRef,
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing,
  error,
  onChangeText,
}: SheetSelectFieldProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-1">
        <Text className="text-[12px] font-semibold text-slate-600 uppercase">{label}</Text>
        {required ? <Text className="text-[12px] font-semibold text-red-500">*</Text> : null}
      </View>
      <View className="rounded-2xl border border-slate-200 px-4 py-3 bg-white flex-row items-center">
        <BottomSheetTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          style={{ fontSize: 15, color: "#0F172A", padding: 0, flex: 1 }}
        />
        <Ionicons name="chevron-down" size={18} color="#94A3B8" />
      </View>
      {error ? <Text className="text-[11px] text-rose-500">{error}</Text> : null}
    </View>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-slate-600">{label}</Text>
      <Text className="text-sm text-slate-900">{value}</Text>
    </View>
  );
}

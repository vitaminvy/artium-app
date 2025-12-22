import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AddressFieldKey, AddressForm, SelectionType } from "../../types";
import { FIELD_ORDER, REQUIRED_FIELDS } from "../../constants";
import { SheetField } from "../ui/SheetField";
import { SheetSelectField } from "../ui/SheetSelectField";
import { SelectionModal } from "../modals/SelectionModal";
import { useLocationData } from "../../hooks/useLocationData";

type Props = {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  initialAddress: AddressForm;
  title: string;
  onSave: (address: AddressForm) => void;
};

export function AddressSheet({ sheetRef, initialAddress, title, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [form, setForm] = useState<AddressForm>(initialAddress);
  const [errors, setErrors] = useState<
    Partial<Record<AddressFieldKey, string>>
  >({});
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [scrollToError, setScrollToError] = useState(false);

  // Selection State
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<SelectionType | null>(
    null
  );
  const [selectionQuery, setSelectionQuery] = useState("");

  // Refs
  const scrollRef = useRef<any>(null);
  const fieldPositions = useRef<Record<AddressFieldKey, number>>(
    {} as Record<AddressFieldKey, number>
  );
  const initialFormRef = useRef<AddressForm>(initialAddress);

  const firstNameRef = useRef<TextInput | undefined>(undefined);
  const lastNameRef = useRef<TextInput | undefined>(undefined);
  const emailRef = useRef<TextInput | undefined>(undefined);
  const countryRef = useRef<TextInput | undefined>(undefined);
  const postalRef = useRef<TextInput | undefined>(undefined);
  const address1Ref = useRef<TextInput | undefined>(undefined);
  const address2Ref = useRef<TextInput | undefined>(undefined);
  const stateRef = useRef<TextInput | undefined>(undefined);
  const cityRef = useRef<TextInput | undefined>(undefined);
  const phoneRef = useRef<TextInput | undefined>(undefined);

  const snapPoints = useMemo(() => ["90%"], []);

  const {
    countries,
    states,
    cities,
    loadingCountries,
    loadingStates,
    loadingCities,
    locationErrors,
    loadCountries,
    loadStates,
    loadCities,
    setStates,
    setCities,
  } = useLocationData();

  // Reset form when initialAddress changes (sheet opens)
  useEffect(() => {
    setForm(initialAddress);
    initialFormRef.current = { ...initialAddress };
    setErrors({});
  }, [initialAddress]);

  const isFormDirty = useMemo(
    () =>
      (Object.keys(form) as Array<keyof AddressForm>).some(
        (key) => form[key] !== initialFormRef.current[key]
      ),
    [form]
  );

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

  const handleRequestClose = () => {
    Keyboard.dismiss();
    if (isFormDirty) {
      setShowExitConfirm(true);
      return;
    }
    sheetRef.current?.dismiss();
  };

  const handleSave = () => {
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
    onSave(form);
    sheetRef.current?.dismiss();
  };

  // Scroll to error logic
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

  // Selection Logic
  const openSelection = (type: SelectionType) => {
    Keyboard.dismiss();
    if (type === "state" && !form.country.trim()) {
      setErrors((prev) => ({
        ...prev,
        country: "Select a country first.",
      }));
      setScrollToError(true);
      return;
    }
    if (type === "city" && !form.state.trim()) {
      setErrors((prev) => ({
        ...prev,
        state: "Select a state first.",
      }));
      setScrollToError(true);
      return;
    }

    setSelectionType(type);
    setSelectionQuery("");

    if (type === "country" && countries.length === 0 && !loadingCountries) {
      void loadCountries();
    }
    if (type === "state" && states.length === 0 && !loadingStates) {
      void loadStates(form.country);
    }
    if (type === "city" && cities.length === 0 && !loadingCities) {
      void loadCities(form.country, form.state);
    }
    setSelectionVisible(true);
  };

  const handleSelectOption = (value: string) => {
    if (!selectionType) return;
    if (selectionType === "country") {
      handleFormChange("country", value);
      handleFormChange("state", "");
      handleFormChange("city", "");
      setStates([]);
      setCities([]);
      void loadStates(value);
    } else if (selectionType === "state") {
      handleFormChange("state", value);
      handleFormChange("city", "");
      setCities([]);
      void loadCities(form.country, value);
    } else if (selectionType === "city") {
      handleFormChange("city", value);
    }
    setSelectionVisible(false);
  };

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

  const selectionOptions = 
    selectionType === "country"
      ? countries
      : selectionType === "state"
      ? states
      : selectionType === "city"
      ? cities
      : [];

  const selectionLoading = 
    selectionType === "country"
      ? loadingCountries
      : selectionType === "state"
      ? loadingStates
      : selectionType === "city"
      ? loadingCities
      : false;

  const selectionError = 
    selectionType === "country"
      ? locationErrors.countries
      : selectionType === "state"
      ? locationErrors.states
      : selectionType === "city"
      ? locationErrors.cities
      : undefined;

  return (
    <>
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        index={0}
        backdropComponent={backdrop}
        handleIndicatorStyle={{ backgroundColor: "#CBD5E1", width: 40 }}
        backgroundStyle={{ backgroundColor: "white" }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="none"
        enableBlurKeyboardOnGesture={false}
        enableDynamicSizing={false}
        onDismiss={() => setShowExitConfirm(false)}
      >
        <View className="flex-1">
          <View className="px-5 pt-2 pb-3 border-b border-slate-100 bg-white">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-slate-900">{title}</Text>
              <Pressable onPress={handleRequestClose} hitSlop={8}>
                <Ionicons name="close-outline" size={26} color="#0F172A" />
              </Pressable>
            </View>
          </View>

          <BottomSheetScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(insets.bottom, 16) + 32,
              gap: 18,
            }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            <View
              onLayout={(e) =>
                handleFieldLayout("firstName", e.nativeEvent.layout.y)
              }
            >
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
            <View
              onLayout={(e) =>
                handleFieldLayout("lastName", e.nativeEvent.layout.y)
              }
            >
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
            <View
              onLayout={(e) =>
                handleFieldLayout("email", e.nativeEvent.layout.y)
              }
            >
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
            <View
              onLayout={(e) =>
                handleFieldLayout("country", e.nativeEvent.layout.y)
              }
            >
              <SheetSelectField
                label="Country"
                required
                inputRef={countryRef}
                value={form.country}
                placeholder="Select Country"
                onChangeText={(value) => handleFormChange("country", value)}
                onPress={() => openSelection("country")}
                loading={loadingCountries}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => postalRef.current?.focus()}
                error={errors.country}
              />
            </View>
            <View
              onLayout={(e) =>
                handleFieldLayout("postalCode", e.nativeEvent.layout.y)
              }
            >
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
            <View
              onLayout={(e) =>
                handleFieldLayout("address1", e.nativeEvent.layout.y)
              }
            >
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
            <View
              onLayout={(e) =>
                handleFieldLayout("state", e.nativeEvent.layout.y)
              }
            >
              <SheetSelectField
                label="State / District / Province"
                required
                inputRef={stateRef}
                value={form.state}
                placeholder="Select State / District / Province"
                onChangeText={(value) => handleFormChange("state", value)}
                onPress={() => openSelection("state")}
                loading={loadingStates}
                disabled={!form.country.trim()}
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
              onPress={() => openSelection("city")}
              loading={loadingCities}
              disabled={!form.state.trim()}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <View
              onLayout={(e) =>
                handleFieldLayout("phone", e.nativeEvent.layout.y)
              }
            >
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
              onPress={handleSave}
              className="rounded-full bg-[#0B73FF] py-4 items-center active:opacity-90"
            >
              <Text className="text-base font-semibold text-white">Save</Text>
            </Pressable>
          </BottomSheetScrollView>
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
                Are you sure{"\n"}
you want to exit?
              </Text>
              <Text className="mt-3 text-base text-slate-500 text-center">
                If you leave this page, your information won't be saved.
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={() => {
                  setShowExitConfirm(false);
                  sheetRef.current?.dismiss();
                }}
                className="rounded-full border border-rose-500 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-rose-500">Yes, exit flow</Text>
              </Pressable>
              <Pressable
                onPress={() => setShowExitConfirm(false)}
                className="rounded-full border border-slate-200 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-slate-700">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <SelectionModal
        visible={selectionVisible}
        onClose={() => setSelectionVisible(false)}
        query={selectionQuery}
        onQueryChange={setSelectionQuery}
        options={selectionOptions}
        onSelect={handleSelectOption}
        loading={selectionLoading}
        error={selectionError}
        maxHeight={Math.min(windowHeight * 0.65, 520)}
      />
    </>
  );
}

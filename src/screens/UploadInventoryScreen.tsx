// Upload Inventory Screen
// src/screens/UploadInventoryScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UploadIcon from "../../assets/upload/upload-icon.svg";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

type InventoryImage = {
  uri: string;
  width?: number;
  height?: number;
};

type ListingStatus = "for_sale" | "inquire" | "sold";
type Unit = "in" | "cm";
type WeightUnit = "lbs" | "kg";

type InventoryDetails = {
  title: string;
  description: string;
  year: string;
  edition: string;
  materials: string;
  price: string;
  quantity: string;
  dimensions: {
    unit: Unit;
    height: string;
    width: string;
    depth: string;
  };
  weight: {
    unit: WeightUnit;
    value: string;
  };
  status: ListingStatus;
  hasFrame: boolean;
};

const STEPS = ["Upload images", "Artwork details"];
const MAX_IMAGES = 5;

const INITIAL_DETAILS: InventoryDetails = {
  title: "",
  description: "",
  year: "",
  edition: "",
  materials: "",
  price: "",
  quantity: "",
  dimensions: {
    unit: "in",
    height: "",
    width: "",
    depth: "",
  },
  weight: {
    unit: "lbs",
    value: "",
  },
  status: "for_sale",
  hasFrame: false,
};

type MediaSource = "camera" | "library";

type LabeledFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  helper?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  onChangeText: (value: string) => void;
};

function LabeledField({
  label,
  value,
  placeholder,
  helper,
  keyboardType,
  multiline,
  onChangeText,
}: LabeledFieldProps) {
  return (
    <View className="gap-3">
      <Text className="text-[12px] font-semibold text-slate-600 uppercase">
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        multiline={multiline}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] text-slate-900"
        style={multiline ? { minHeight: 112, textAlignVertical: "top" } : undefined}
      />
      {helper ? (
        <Text className="text-[11px] text-slate-400">{helper}</Text>
      ) : null}
    </View>
  );
}

type SectionCardProps = {
  title: string;
  children: React.ReactNode;
  subtitle?: string;
};

function SectionCard({ title, children, subtitle }: SectionCardProps) {
  return (
    <View className="rounded-[24px] border border-slate-200 bg-white p-5 gap-5">
      <View className="gap-1">
        <Text className="text-[12px] font-semibold text-slate-600 uppercase tracking-[1px]">
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-slate-400">{subtitle}</Text>
        ) : null}
      </View>
      <View className="gap-5">{children}</View>
    </View>
  );
}

type UnitToggleProps<T extends string> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
};

function UnitToggle<T extends string>({ value, options, onChange }: UnitToggleProps<T>) {
  return (
    <View className="flex-row items-center gap-4">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className="flex-row items-center gap-2 active:opacity-80"
          >
            <View
              className={`h-5 w-5 rounded-full border items-center justify-center ${active ? "border-[#0B73FF]" : "border-slate-300"
                }`}
            >
              {active ? (
                <View className="h-2.5 w-2.5 rounded-full bg-[#0B73FF]" />
              ) : null}
            </View>
            <Text
              className={`text-sm ${active ? "text-slate-900 font-semibold" : "text-slate-500"
                }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type CheckboxProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

function Checkbox({ label, value, onToggle }: CheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 active:opacity-80"
    >
      <View
        className={`h-5 w-5 rounded-md border items-center justify-center ${value ? "bg-slate-900 border-slate-900" : "border-slate-300 bg-white"
          }`}
      >
        {value ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
      <Text className="text-sm text-slate-700">{label}</Text>
    </Pressable>
  );
}

type StepIndicatorProps = {
  step: number;
  steps: string[];
};

function StepIndicator({ step, steps }: StepIndicatorProps) {
  return (
    <View className="px-6 pt-4 pb-2">
      <View className="flex-row items-center gap-3">
        {steps.map((label, index) => (
          <View
            key={`${label}-${index}`}
            className={`flex-1 h-2 rounded-full ${index <= step ? "bg-emerald-400" : "bg-emerald-100"
              }`}
          />
        ))}
      </View>
      <View className="mt-3 flex-row justify-center gap-8">
        {steps.map((label, index) => {
          const isActive = index === step;
          return (
            <Text
              key={`${label}-label`}
              className={`text-[15px] font-semibold ${isActive ? "text-slate-900" : "text-slate-400"}`}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export default function UploadInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { setHidden, lastTab } = useTabBarVisibility();
  const navigation = useNavigation();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<InventoryImage[]>([]);
  const [details, setDetails] = useState<InventoryDetails>(INITIAL_DETAILS);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const canContinue = images.length > 0;
  const canSubmit = useMemo(
    () => details.title.trim().length > 0 && images.length > 0,
    [details.title, images.length]
  );

  useFocusEffect(
    useCallback(() => {
      setHidden(true);
      return () => setHidden(false);
    }, [setHidden])
  );

  const chooseSource = useCallback(async (): Promise<MediaSource | null> => {
    if (Platform.OS === "ios") {
      return new Promise((resolve) => {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ["Camera", "Photo Library", "Cancel"],
            cancelButtonIndex: 2,
          },
          (buttonIndex) => {
            if (buttonIndex === 0) return resolve("camera");
            if (buttonIndex === 1) return resolve("library");
            resolve(null);
          }
        );
      });
    }

    return new Promise((resolve) => {
      Alert.alert("Choose source", "", [
        { text: "Camera", onPress: () => resolve("camera") },
        { text: "Photo Library", onPress: () => resolve("library") },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ]);
    });
  }, []);

  const ensurePermission = useCallback(async (source: MediaSource) => {
    if (source === "library") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow access to your photo library to continue."
        );
        return false;
      }
      return true;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your camera to continue."
      );
      return false;
    }
    return true;
  }, []);

  const handlePickImages = useCallback(async () => {
    const source = await chooseSource();
    if (!source) return;

    const hasPermission = await ensurePermission(source);
    if (!hasPermission) return;

    const pickerResult =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.9,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsMultipleSelection: true,
          quality: 0.9,
        });

    if (pickerResult.canceled || !pickerResult.assets?.length) return;

    const newImages = pickerResult.assets.map((asset) => ({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    }));

    setImages((prev) => {
      const nextImages = [...prev, ...newImages];
      if (nextImages.length > MAX_IMAGES) {
        Alert.alert("Limit reached", `You can upload up to ${MAX_IMAGES} images.`);
      }
      return nextImages.slice(0, MAX_IMAGES);
    });
  }, [chooseSource, ensurePermission]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const resetForm = useCallback(() => {
    setStep(0);
    setImages([]);
    setDetails(INITIAL_DETAILS);
  }, []);

  const goToPreviousTab = useCallback(() => {
    let parent: any = navigation;
    let tabNav: any = null;

    while (parent?.getParent) {
      parent = parent.getParent();
      if (!parent) break;
      const state = parent.getState?.();
      const routeNames: string[] | undefined = state?.routeNames;
      const isTab = state?.type === "tab";
      if (isTab || routeNames?.includes("Home")) {
        tabNav = parent;
        break;
      }
    }

    if (tabNav) {
      const target = lastTab ?? tabNav.getState?.().routeNames?.[0] ?? "Home";
      tabNav.navigate(target);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    // Fallback: do nothing if nowhere to go
  }, [lastTab, navigation]);

  const handleCancel = useCallback(() => {
    if (!images.length) {
      goToPreviousTab();
      return;
    }
    setShowExitConfirm(true);
  }, [goToPreviousTab, images.length]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    Alert.alert("Listing saved", "Your inventory listing is ready to review.");
  }, [canSubmit]);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View
          className="px-6 pb-2 items-center"
          style={{ paddingTop: Math.max(insets.top, 24) }}
        >
          <Text className="text-2xl font-semibold text-slate-900 text-center">
            Upload Artwork
          </Text>
          <Text className="text-sm text-slate-500 mt-1 text-center">
            Add images and details to your inventory listing.
          </Text>
        </View>

        <StepIndicator step={step} steps={STEPS} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 120 + insets.bottom,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {step === 0 ? (
            <View className="px-6 pb-8 gap-6">
              <View className="rounded-[28px] border border-slate-200 bg-white p-5 gap-4 mt-6">
                <View className="h-[260px]">
                  {images.length === 0 ? (
                    <Pressable
                      onPress={handlePickImages}
                      className="flex-1 rounded-[24px] border border-dashed border-slate-300 bg-white items-center justify-center gap-3 active:opacity-80"
                    >
                      <UploadIcon width={100} height={100} />
                      <Text className="text-lg font-semibold text-slate-900">
                        Upload images of your artwork
                      </Text>
                      <Text className="text-sm text-slate-500 text-center">
                        Supported formats: GIF, PNG, JPG, JPEG, HEIC.
                      </Text>
                    </Pressable>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ paddingHorizontal: 4, alignItems: "center" }}
                    >
                      {images.map((image, index) => (
                        <View
                          key={`${image.uri}-${index}`}
                          className="mr-4 rounded-[24px] overflow-hidden border border-slate-200 bg-slate-50"
                          style={{ width: 190, height: 230 }}
                        >
                          <Image
                            source={{ uri: image.uri }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                          />
                          {index === 0 ? (
                            <View className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1">
                              <Text className="text-[11px] font-semibold text-slate-700">
                                Main Image
                              </Text>
                            </View>
                          ) : null}
                          <Pressable
                            onPress={() => handleRemoveImage(index)}
                            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/85 items-center justify-center active:opacity-80"
                          >
                            <Ionicons name="close" size={18} color="#0F172A" />
                          </Pressable>
                        </View>
                      ))}
                      {images.length < MAX_IMAGES ? (
                        <Pressable
                          onPress={handlePickImages}
                          className="mr-4 rounded-[24px] border border-dashed border-slate-300 bg-white items-center justify-center gap-3 active:opacity-80"
                          style={{ width: 190, height: 230 }}
                        >
                          <Ionicons name="add" size={30} color="#0F172A" />
                          <Text className="text-sm font-semibold text-slate-700 text-center">
                            Add or change{`\n`}images
                          </Text>
                        </Pressable>
                      ) : null}
                    </ScrollView>
                  )}
                </View>

                <Text className="text-xs text-slate-400">
                  Upload up to {MAX_IMAGES} images of your artwork. Your additional images
                  will maintain their original ratio.
                </Text>
              </View>
            </View>
          ) : (
            <View className="px-6 pb-10 gap-6">
              <SectionCard title="Artwork details">
                <LabeledField
                  label="Artwork title"
                  value={details.title}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, title: value }))
                  }
                  placeholder="Artwork title"
                />
                <LabeledField
                  label="Description"
                  value={details.description}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="Describe your artwork"
                  multiline
                  helper="Tell buyers about the story, process, or inspiration."
                />
                <LabeledField
                  label="Year"
                  value={details.year}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, year: value }))
                  }
                  placeholder="2024"
                  keyboardType="numeric"
                />
                <LabeledField
                  label="Edition"
                  value={details.edition}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, edition: value }))
                  }
                  placeholder="12/100, Limited Edition, etc."
                />
                <View className="gap-2">
                  <Text className="text-[12px] font-semibold text-slate-600 uppercase">
                    Dimensions
                  </Text>
                  <UnitToggle
                    value={details.dimensions.unit}
                    options={[
                      { label: "in", value: "in" },
                      { label: "cm", value: "cm" },
                    ]}
                    onChange={(value) =>
                      setDetails((prev) => ({
                        ...prev,
                        dimensions: { ...prev.dimensions, unit: value },
                      }))
                    }
                  />
                  <View className="flex-row items-center gap-4">
                    <View className="flex-1 gap-3">
                      <Text className="text-sm text-slate-600">Height</Text>
                      <TextInput
                        value={details.dimensions.height}
                        onChangeText={(value) =>
                          setDetails((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, height: value },
                          }))
                        }
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
                      />
                    </View>
                    <View className="flex-1 gap-3">
                      <Text className="text-sm text-slate-600">Width</Text>
                      <TextInput
                        value={details.dimensions.width}
                        onChangeText={(value) =>
                          setDetails((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, width: value },
                          }))
                        }
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
                      />
                    </View>
                    <View className="flex-1 gap-3">
                      <Text className="text-sm text-slate-600">Depth</Text>
                      <TextInput
                        value={details.dimensions.depth}
                        onChangeText={(value) =>
                          setDetails((prev) => ({
                            ...prev,
                            dimensions: { ...prev.dimensions, depth: value },
                          }))
                        }
                        placeholder="0"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-4 text-[15px] text-slate-900"
                      />
                    </View>
                  </View>
                </View>
                <View className="gap-2">
                  <Text className="text-[12px] font-semibold text-slate-600 uppercase">
                    Weight
                  </Text>
                  <UnitToggle
                    value={details.weight.unit}
                    options={[
                      { label: "lbs", value: "lbs" },
                      { label: "kg", value: "kg" },
                    ]}
                    onChange={(value) =>
                      setDetails((prev) => ({
                        ...prev,
                        weight: { ...prev.weight, unit: value },
                      }))
                    }
                  />
                  <TextInput
                    value={details.weight.value}
                    onChangeText={(value) =>
                      setDetails((prev) => ({
                        ...prev,
                        weight: { ...prev.weight, value },
                      }))
                    }
                    placeholder="0"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[15px] text-slate-900"
                  />
                </View>

                <LabeledField
                  label="Materials"
                  value={details.materials}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, materials: value }))
                  }
                  placeholder="Oil on canvas"
                />
              </SectionCard>

              <SectionCard
                title="Listing information"
                subtitle="Choose whether to list this artwork's availability status for sale, allow for inquiry, or mark it as sold."
              >
                <View className="gap-4">
                  <Text className="text-[12px] font-semibold text-slate-600 uppercase">
                    Listing status
                  </Text>
                  <View className="flex-row gap-3">
                    {[
                      { value: "for_sale", label: "For Sale" },
                      { value: "inquire", label: "Inquire to Purchase" },
                      { value: "sold", label: "Sold", pro: true, disabled: true },
                    ].map((option) => {
                      const active = details.status === option.value;
                      const disabled = option.disabled;
                      return (
                        <Pressable
                          key={option.value}
                          disabled={disabled}
                          onPress={() => {
                            if (disabled) return;
                            setDetails((prev) => ({
                              ...prev,
                              status: option.value as ListingStatus,
                            }));
                          }}
                          className={`flex-1 rounded-2xl border px-3 py-3 items-center justify-center ${active
                            ? "bg-white border-[#0B73FF]"
                            : "bg-white border-slate-200"
                            } ${disabled ? "opacity-70" : ""}`}
                        >
                          <View className="flex-row items-center justify-center gap-2">
                            <Text
                              className={`text-[15px] font-semibold text-center ${active ? "text-[#0B73FF]" : "text-slate-700"
                                } ${disabled ? "text-slate-500" : ""}`}
                            >
                              {option.label}
                            </Text>
                            {option.pro ? (
                              <View className="px-2 py-1 rounded-full bg-[#e0e7ff]">
                                <Text className="text-[11px] font-semibold text-[#4f46e5]">
                                  Pro
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                {details.status === "inquire" ? (
                  <Text className="text-sm text-slate-600">
                    Interested buyers can make an offer or ask to learn more about this artwork.
                  </Text>
                ) : null}
                <LabeledField
                  label="Artwork price"
                  value={details.price}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, price: value }))
                  }
                  placeholder="US$ 12,345"
                  keyboardType="numeric"
                />
                <Text className="text-sm text-slate-500">
                  Artium takes a commission from every sale. Learn more
                </Text>
                <LabeledField
                  label="Quantity available"
                  value={details.quantity}
                  onChangeText={(value) =>
                    setDetails((prev) => ({ ...prev, quantity: value }))
                  }
                  placeholder="1"
                  keyboardType="numeric"
                />
                <Text className="text-sm text-slate-500">
                  For your reference only. Price and quantity will appear in your Inventory but won’t be visible to buyers.
                </Text>
              </SectionCard>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        className="border-t border-slate-200 bg-white px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {step === 0 ? (
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={handleCancel}
              className="flex-1 rounded-full border border-slate-200 py-3 items-center active:opacity-80"
            >
              <Text className="text-sm font-semibold text-slate-600">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setStep(1)}
              disabled={!canContinue}
              className={`flex-1 rounded-full py-3 items-center ${canContinue ? "bg-[#0B73FF]" : "bg-slate-200"
                }`}
            >
              <Text
                className={`text-sm font-semibold ${canContinue ? "text-white" : "text-slate-500"
                  }`}
              >
                Continue
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={handleCancel}
              className="flex-1 rounded-full border border-slate-200 py-3 items-center active:opacity-80"
            >
              <Text className="text-sm font-semibold text-slate-600">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              className={`flex-1 rounded-full py-3 items-center ${canSubmit ? "bg-[#0B73FF]" : "bg-slate-200"
                }`}
            >
              <Text
                className={`text-sm font-semibold ${canSubmit ? "text-white" : "text-slate-500"
                  }`}
              >
                Submit
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Modal visible={showExitConfirm} transparent animationType="fade" onRequestClose={() => setShowExitConfirm(false)}>
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
                All your process will be lost if you exit the uploading process now.
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={() => {
                  setShowExitConfirm(false);
                  resetForm();
                  goToPreviousTab();
                }}
                className="rounded-full border border-rose-500 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-rose-500">
                  Exit uploading
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowExitConfirm(false)}
                className="rounded-full border border-slate-200 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-slate-700">
                  Continue uploading
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

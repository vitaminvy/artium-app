import { useCallback, useMemo, useState } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { InventoryDetails, InventoryImage, MediaSource, Artwork } from "../types";
import { INITIAL_DETAILS, MAX_IMAGES } from "../constants";
import { FieldKey } from "../components/ArtworkDetailsStep";

const DEFAULT_UPLOAD_FOLDER = "Unsorted";

export function useUploadInventory() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<InventoryImage[]>([]);
  const [details, setDetails] = useState<InventoryDetails>(INITIAL_DETAILS);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scrollToError, setScrollToError] = useState(false);

  // Computed states
  const canContinue = images.length > 0;
  const canSubmit = useMemo(
    () => details.title.trim().length > 0 && images.length > 0,
    [details.title, images.length]
  );

  const validateDetails = useCallback(() => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const require = (cond: boolean, key: FieldKey, message: string) => {
      if (!cond) nextErrors[key] = message;
    };

    require(details.title.trim().length > 0, "title", "Please enter a title.");
    require(details.description.trim().length > 0, "description", "Please add a description.");
    require(details.year.trim().length > 0, "year", "Year is required.");
    require(details.edition.trim().length > 0, "edition", "Edition is required.");
    const dimsMissing =
      !details.dimensions.height.trim().length ||
      !details.dimensions.width.trim().length ||
      !details.dimensions.depth.trim().length;
    if (dimsMissing) {
      nextErrors["dimensions.height"] = "Dimensions are required.";
    }
    require(details.weight.value.trim().length > 0, "weight.value", "Weight is required.");
    require(details.materials.trim().length > 0, "materials", "Materials are required.");
    require(details.price.trim().length > 0, "price", "Price is required.");
    require(details.quantity.trim().length > 0, "quantity", "Quantity is required.");

    return nextErrors;
  }, [details]);

  const clearFieldError = useCallback((key: FieldKey) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // --- Logic for Image Picking ---
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
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        Alert.alert(
          "Limit reached",
          `You can upload up to ${MAX_IMAGES} images.`
        );
      }
      return nextImages.slice(0, MAX_IMAGES);
    });
  }, [chooseSource, ensurePermission]);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  // --- Logic for Navigation & Reset ---
  const resetForm = useCallback(() => {
    setStep(0);
    setImages([]);
    setDetails(INITIAL_DETAILS);
    setSelectedTags([]);
    setErrors({});
    setScrollToError(false);
  }, []);

  const goToPreviousTab = useCallback(() => {
    // Basic navigation back logic
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Home");
    }
  }, [navigation]);

  const handleCancel = useCallback(() => {
    if (!images.length) {
      goToPreviousTab();
      return;
    }
    setShowExitConfirm(true);
  }, [goToPreviousTab, images.length]);

  const handleNextFromDetails = useCallback(() => {
    const validation = validateDetails();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setStep(1);
      setScrollToError(true);
      return false;
    }
    setErrors({});
    setScrollToError(false);
    setStep(2);
    return true;
  }, [validateDetails]);

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSubmit = useCallback(() => {
    const validation = validateDetails();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setStep(1);
      setScrollToError(true);
      return;
    }
    setErrors({});
    setScrollToError(false);
    const yearNumber = parseInt(details.year, 10);
    const dimensionText = `${details.dimensions.height || "?"} x ${
      details.dimensions.width || "?"
    } ${details.dimensions.unit}`;
    const newArtwork: Artwork = {
      id: `aw-${Date.now()}`,
      title: details.title || "Untitled",
      artist: "Unknown Artist",
      year: Number.isFinite(yearNumber) ? yearNumber : new Date().getFullYear(),
      price: details.price ? `$${details.price}` : "Price upon request",
      status: "Available",
      folder: DEFAULT_UPLOAD_FOLDER,
      thumbnail: images[0]?.uri ?? "",
      images: images.length ? images.map((img) => img.uri) : undefined,
      tags: selectedTags.length ? selectedTags : undefined,
      details,
      dimensions: dimensionText,
    };

    navigation.navigate("Tabs", {
      screen: "Home",
      params: {
        screen: "Inventory",
        params: { newArtwork },
      },
    });
    setStep(0);
    setImages([]);
    setDetails(INITIAL_DETAILS);
    setSelectedTags([]);
  }, [validateDetails, details, images, navigation, selectedTags]);

  return {
    step,
    setStep,
    images,
    details,
    setDetails,
    showExitConfirm,
    setShowExitConfirm,
    canContinue,
    canSubmit,
    handlePickImages,
    handleRemoveImage,
    handleCancel,
    handleNextFromDetails,
    handleSubmit,
    resetForm,
    goToPreviousTab,
    errors,
    setErrors,
    clearFieldError,
    scrollToError,
    setScrollToError,
    selectedTags,
    handleToggleTag,
  };
}

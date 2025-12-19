import { useCallback, useMemo, useState } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { InventoryDetails, InventoryImage, MediaSource } from "../types";
import { INITIAL_DETAILS, MAX_IMAGES } from "../constants";

export function useUploadInventory() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<InventoryImage[]>([]);
  const [details, setDetails] = useState<InventoryDetails>(INITIAL_DETAILS);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Computed states
  const canContinue = images.length > 0;
  const canSubmit = useMemo(
    () => details.title.trim().length > 0 && images.length > 0,
    [details.title, images.length]
  );

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

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    // TODO: Add API call here
    Alert.alert("Listing saved", "Returning to Home.");
    navigation.navigate("Home");
  }, [canSubmit, navigation]);

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
    handleSubmit,
    resetForm,
    goToPreviousTab,
  };
}

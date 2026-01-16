import { useCallback, useMemo, useState, useEffect } from "react";
import { ActionSheetIOS, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { InventoryDetails, InventoryImage, MediaSource } from "../types";
import { INITIAL_DETAILS, MAX_IMAGES } from "../constants";
import { FieldKey } from "../components/ArtworkDetailsStep";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { updateArtwork } from "@/domains/artwork/services/artworkService";
import { uploadIfLocal } from "@/shared/services/uploadService";
import { ArtworkDetail } from "@/domains/artwork/types";

type EditArtworkRouteParams = {
  EditArtwork: {
    artwork: ArtworkDetail;
  };
};

export function useEditArtwork() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<EditArtworkRouteParams, "EditArtwork">>();
  const { currentUser } = useAuth();
  const artwork = route.params?.artwork;

  const [step, setStep] = useState(0);
  const [images, setImages] = useState<InventoryImage[]>([]);
  const [details, setDetails] = useState<InventoryDetails>(INITIAL_DETAILS);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [scrollToError, setScrollToError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form with artwork data
  useEffect(() => {
    if (!artwork) return;

    // Set images
    setImages(
      artwork.images.map((uri) => ({
        uri,
        width: 800,
        height: 800,
      }))
    );

    // Parse price
    let priceValue = "";
    if (artwork.priceSnapshot?.amount) {
      priceValue = artwork.priceSnapshot.amount.toString();
    } else if (typeof artwork.price === "string") {
      const match = artwork.price.match(/[\d,]+/);
      if (match) {
        priceValue = match[0].replace(/,/g, "");
      }
    }

    // Parse weight
    let weightValue = "";
    let weightUnit: "lbs" | "kg" = "lbs";
    if (artwork.weightValue !== undefined) {
      weightValue = artwork.weightValue.toString();
      weightUnit = (artwork.weightUnit === "kg" ? "kg" : "lbs");
    } else if (typeof artwork.weight === "string" && artwork.weight) {
      // Parse from string format like "5 lbs" or "10 kg"
      const weightMatch = artwork.weight.match(/([\d.]+)\s*(lbs?|kgs?)/i);
      if (weightMatch) {
        weightValue = weightMatch[1];
        const unit = weightMatch[2].toLowerCase();
        weightUnit = unit.startsWith("kg") ? "kg" : "lbs";
      }
    }

    // Parse dimension unit
    const dimensionUnit: "in" | "cm" =
      artwork.dimension?.unit === "cm" ? "cm" : "in";

    // Parse status
    const artworkStatus: "for_sale" | "inquire" | "sold" =
      artwork.status === "sold" ? "sold" :
      artwork.status === "for_sale" ? "for_sale" :
      "for_sale";

    // Set details
    setDetails({
      title: artwork.title || "",
      description: artwork.description || "",
      year: artwork.year?.toString() || "",
      edition: artwork.edition?.toString() || "",
      dimensions: {
        height: artwork.dimension?.h?.toString() || "",
        width: artwork.dimension?.w?.toString() || "",
        depth: artwork.dimension?.d?.toString() || "",
        unit: dimensionUnit,
      },
      weight: {
        value: weightValue,
        unit: weightUnit,
      },
      materials: artwork.materials || "",
      price: priceValue,
      quantity: "1",
      status: artworkStatus,
      hasFrame: false,
    });

    // Set tags
    setSelectedTags(artwork.tags || []);
  }, [artwork]);

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
  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleCancel = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

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

  const handleSubmit = useCallback(async () => {
    if (!artwork || !currentUser) {
      Alert.alert("Error", "Cannot update artwork.");
      return;
    }

    const validation = validateDetails();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setStep(1);
      setScrollToError(true);
      return;
    }
    if (submitting) return;
    setErrors({});
    setScrollToError(false);
    setSubmitting(true);

    const yearNumber = parseInt(details.year, 10);
    const editionNumber = parseInt(details.edition, 10);
    const height = parseFloat(details.dimensions.height);
    const width = parseFloat(details.dimensions.width);
    const depth = parseFloat(details.dimensions.depth);
    const weightValue = parseFloat(details.weight.value);

    try {
      // Upload new images (only local URIs)
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          // If the URI is already a Firebase URL, keep it as is
          if (img.uri.startsWith("http")) {
            return img.uri;
          }
          // Otherwise upload it
          return (await uploadIfLocal(img.uri, "artworks")) || img.uri;
        })
      );

      await updateArtwork(artwork.id, currentUser.uid, {
        title: details.title || "Untitled",
        description: details.description || "",
        year: Number.isFinite(yearNumber) ? yearNumber : new Date().getFullYear(),
        edition: Number.isFinite(editionNumber) ? editionNumber : 1,
        materials: details.materials || "",
        price: details.price ? `USD $${details.price}` : "Price on Request",
        images: uploadedImages,
        tags: selectedTags,
        dimension: {
          h: Number.isFinite(height) ? height : 0,
          w: Number.isFinite(width) ? width : 0,
          d: Number.isFinite(depth) ? depth : 0,
          unit: details.dimensions.unit,
        },
        weight: Number.isFinite(weightValue)
          ? `${weightValue} ${details.weight.unit}`
          : "0",
        status: details.status,
      });

      Alert.alert("Success", "Artwork updated successfully!", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to update artwork:", error);
      Alert.alert("Update failed", "Could not update artwork. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    validateDetails,
    details,
    images,
    navigation,
    selectedTags,
    currentUser,
    artwork,
    submitting,
  ]);

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
    goBack,
    errors,
    setErrors,
    clearFieldError,
    scrollToError,
    setScrollToError,
    selectedTags,
    handleToggleTag,
  };
}

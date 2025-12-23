import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export const pickImageFromLibrary = async (): Promise<string | undefined> => {
  try {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (current.status !== "granted") {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please allow photo access to upload."
        );
        return undefined;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      exif: false,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets?.length) {
      return result.assets[0].uri;
    }
  } catch (err) {
    console.error("pickImage error", err);
    Alert.alert(
      "Upload failed",
      "Could not open photo library. Please try again."
    );
  }
  return undefined;
};

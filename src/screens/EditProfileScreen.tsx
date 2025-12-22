import React from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import EditProfileHeader from "../domains/user/components/editProfile/EditProfileHeader";
import EditProfileSection from "../domains/user/components/editProfile/EditProfileSection";
import AvatarUploader from "../domains/user/components/editProfile/AvatarUploader";
import TextField from "../domains/user/components/editProfile/TextField";
import PhoneField from "../domains/user/components/editProfile/PhoneField";
import { useEditProfileForm } from "../domains/user/hooks/useEditProfileForm";
import { EDIT_PROFILE_LABELS } from "../domains/user/constants/editProfile";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "EditProfile"
>;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const {
    control,
    limits,
    submit,
    formState,
    setValue,
    reset,
  } = useEditProfileForm();
  const usernameRef = React.useRef<TextInput | null>(null);
  const firstNameRef = React.useRef<TextInput | null>(null);
  const lastNameRef = React.useRef<TextInput | null>(null);
  const phoneRef = React.useRef<TextInput | null>(null);
  const addressRef = React.useRef<TextInput | null>(null);

  const pickImage = async () => {
    try {
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (current.status !== "granted") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permission.status !== "granted") {
          Alert.alert("Permission needed", "Please allow photo access to upload.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        shape: "oval",
        quality: 1,
        presentationStyle: ImagePicker.UIImagePickerPresentationStyle.FULL_SCREEN,
      });

      if (!result.canceled && result.assets?.length) {
        setValue("avatar", result.assets[0].uri, { shouldDirty: true });
      }
    } catch (err) {
      console.error("pickImage error", err);
      Alert.alert("Upload failed", "Could not open photo library. Please try again.");
    }
  };

  const onSave = submit(async (values) => {
    // TODO: replace with API call
    await new Promise((res) => setTimeout(res, 500));
    Alert.alert("Profile saved", "Your changes have been saved.");
    reset(values);
    navigation.goBack();
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1">
        <EditProfileHeader
          onBack={() => navigation.goBack()}
          onSave={onSave}
          saveDisabled={formState.isSubmitting || !formState.isDirty}
        />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 220 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <EditProfileSection title={EDIT_PROFILE_LABELS.basicInfo}>
            <Controller
              control={control}
              name="avatar"
              render={({ field: { value, onChange } }) => (
                <AvatarUploader
                  value={value}
                  onPick={pickImage}
                  onClear={() => onChange(undefined)}
                />
              )}
            />

            <TextField
              control={control}
              name="username"
              label={EDIT_PROFILE_LABELS.username}
              required
              maxLength={limits.username}
              helperText={EDIT_PROFILE_LABELS.usernameHint}
              rules={{ required: "Username is required" }}
              inputRef={usernameRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => firstNameRef.current?.focus()}
            />

            <TextField
              control={control}
              name="firstName"
              label={EDIT_PROFILE_LABELS.firstName}
              required
              maxLength={limits.firstName}
              rules={{ required: "First name is required" }}
              inputRef={firstNameRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />

            <TextField
              control={control}
              name="lastName"
              label={EDIT_PROFILE_LABELS.lastName}
              maxLength={limits.lastName}
              inputRef={lastNameRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneRef.current?.focus()}
            />

            <PhoneField
              control={control}
              label={EDIT_PROFILE_LABELS.phoneNumber}
              maxLength={limits.phoneNumber}
              inputRef={phoneRef}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => addressRef.current?.focus()}
            />

            <TextField
              control={control}
              name="address"
              label={EDIT_PROFILE_LABELS.address}
              maxLength={limits.address}
              inputRef={addressRef}
              returnKeyType="done"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
          </EditProfileSection>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

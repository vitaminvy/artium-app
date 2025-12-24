import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TextInput,
  Modal,
  Pressable,
  Text,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import EditProfileHeader from "../domains/user/components/editProfile/EditProfileHeader";
import EditProfileSection from "../domains/user/components/editProfile/EditProfileSection";
import AvatarUploader from "../domains/user/components/editProfile/AvatarUploader";
import TextField from "../domains/user/components/editProfile/TextField";
import PhoneField from "../domains/user/components/editProfile/PhoneField";
import { useEditProfileForm } from "../domains/user/hooks/useEditProfileForm";
import { EDIT_PROFILE_LABELS } from "../domains/user/constants/editProfile";
import { useProfileContext } from "../domains/user/contexts/ProfileContext";
import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "EditProfile"
>;

export default function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { editProfile, updateProfile } = useProfileContext();
  const {
    control,
    limits,
    submit,
    formState,
    setValue,
    reset,
  } = useEditProfileForm(editProfile);
  
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const pendingAction = useRef<any>(null);
  const isSaving = useRef(false);

  const usernameRef = React.useRef<TextInput | null>(null);
  const firstNameRef = React.useRef<TextInput | null>(null);
  const lastNameRef = React.useRef<TextInput | null>(null);
  const phoneRef = React.useRef<TextInput | null>(null);
  const addressRef = React.useRef<TextInput | null>(null);

  // Intercept back navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isSaving.current || !formState.isDirty) {
        return;
      }

      e.preventDefault();
      pendingAction.current = e.data.action;
      setShowExitConfirm(true);
    });

    return unsubscribe;
  }, [navigation, formState.isDirty]);

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    if (pendingAction.current) {
      navigation.dispatch(pendingAction.current);
    } else {
      navigation.goBack();
    }
  };

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
    try {
      await updateProfile(values);
      reset(values);
      isSaving.current = true;
      Alert.alert("Profile saved", "Your changes have been saved.");
      navigation.goBack();
    } catch (error) {
      console.error("Save profile error:", error);
      Alert.alert("Error", "Failed to save profile changes.");
      isSaving.current = false;
    }
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
                  onClear={() => onChange(null)}
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

      {/* Exit Confirmation Modal */}
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
                Discard changes?
              </Text>
              <Text className="mt-3 text-base text-slate-500 text-center">
                You have unsaved changes. Are you sure you want to discard them?
              </Text>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={handleConfirmExit}
                className="rounded-full border border-rose-500 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-rose-500">
                  Discard changes
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowExitConfirm(false)}
                className="rounded-full border border-slate-200 py-3 items-center active:opacity-80"
              >
                <Text className="text-base font-semibold text-slate-700">
                  Keep editing
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

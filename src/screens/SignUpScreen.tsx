import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { signOut } from "firebase/auth";

import { AuthStackParamList } from "@/app/navigation/AuthStack";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { useSignUp } from "@/domains/auth/hooks/useSignUp";
import { auth } from "@/configs/firebase";
import { useGoogleAuth } from "@/domains/auth/hooks/useGoogleAuth";
import AuthScreenLayout from "@/shared/components/auth/AuthScreenLayout";
import AuthGoogleButton from "@/shared/components/auth/AuthGoogleButton";
import AuthDivider from "@/shared/components/auth/AuthDivider";
import AuthTextField from "@/shared/components/auth/AuthTextField";
import AuthPasswordField from "@/shared/components/auth/AuthPasswordField";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignUp">;
};

export default function SignUpScreen({ navigation }: Props) {
  const { suppressNextAuth, clearSuppressNextAuth } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, loading: signUpLoading, error: signUpError, clearError } =
    useSignUp();

  const {
    signInWithGoogle,
    loading: googleLoading,
    error: googleError,
    clearError: clearGoogleError,
  } = useGoogleAuth();

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const isBusy = signUpLoading || googleLoading;
  const errorMsg = googleError || signUpError || "";

  const onGoogleButtonPress = async () => {
    clearError();
    clearGoogleError();
    suppressNextAuth();

    const user = await signInWithGoogle();

    // If sign-in failed or was cancelled, we clear the suppression
    if (!user) {
      clearSuppressNextAuth();
    } else {
      // Success: AuthContext will handle state change and navigation.
      // We do NOT sign out here, unlike the email flow below.
      // This provides a smoother UX for Google users.
      clearSuppressNextAuth();
    }
  };

  const onEmailSignUp = async () => {
    clearError();
    clearGoogleError();
    suppressNextAuth();
    const user = await signUp(name.trim() || undefined, email, password);
    if (!user) {
      clearSuppressNextAuth();
      return;
    }

    // Immediately sign out to prevent auto-login
    try {
      await signOut(auth);
      // Wait for auth state to propagate through the system
      await new Promise((resolve) => setTimeout(resolve, 300));
      clearSuppressNextAuth();
      // Reset navigation stack to ensure we're on the LogIn screen
      navigation.reset({
        index: 0,
        routes: [{ name: "LogIn" }],
      });
    } catch (error) {
      console.error("Failed to sign out after sign-up:", error);
      clearSuppressNextAuth();
    }
  };

  return (
    <AuthScreenLayout title="Create account">
      <View>
        <View className="flex-row justify-center">
          <AuthGoogleButton
            label="Sign up with Google"
            onPress={onGoogleButtonPress}
            loading={googleLoading}
            disabled={isBusy}
          />
        </View>
      </View>

      <AuthDivider />

      <View className="gap-6">
        <AuthTextField
          label="DISPLAY NAME"
          inputRef={nameInputRef}
          placeholder="How should we call you?"
          autoCapitalize="words"
          returnKeyType="next"
          returnKeyLabel="›"
          blurOnSubmit={false}
          onSubmitEditing={() => emailInputRef.current?.focus()}
          onChangeText={setName}
          value={name}
          editable={!isBusy}
        />

        <AuthTextField
          label="EMAIL ADDRESS"
          required
          inputRef={emailInputRef}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
          returnKeyLabel="›"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          onChangeText={setEmail}
          value={email}
          editable={!isBusy}
        />

        <AuthPasswordField
          label="PASSWORD"
          required
          inputRef={passwordInputRef}
          placeholder="Create a password"
          returnKeyType="done"
          onSubmitEditing={() => {
            passwordInputRef.current?.blur();
            onEmailSignUp();
          }}
          onChangeText={setPassword}
          value={password}
          editable={!isBusy}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
        />
      </View>

      {errorMsg ? (
        <Text className="text-red-500 text-xs mt-2">{errorMsg}</Text>
      ) : null}

      <Pressable
        onPress={onEmailSignUp}
        disabled={isBusy}
        className={`mt-8 h-[50px] rounded-[14px] items-center justify-center shadow-sm ${
          isBusy ? "bg-[#bcd3f6]" : "bg-[#2d74ed] active:bg-[#2163d2]"
        }`}
      >
        {signUpLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base font-semibold">Sign Up</Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("LogIn")}
        disabled={isBusy}
        className="mt-5 items-center"
      >
        <Text className="text-sm text-gray-700">
          Already with Artium?{" "}
          <Text className="font-semibold text-[#1a73e8]">Sign in</Text>
        </Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

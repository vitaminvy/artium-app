import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  Text,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { signOut } from "firebase/auth";

import { AuthStackParamList } from "@/app/navigation/AuthStack";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import { useSignUp } from "@/domains/auth/hooks/useSignUp";
import { auth } from "@/configs/firebase";
import { useGoogleAuth } from "@/domains/auth/hooks/useGoogleAuth";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignUp">;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 280;

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
    clearError: clearGoogleError
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
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        <View className="flex-1 bg-white">
          <View className="relative">
          <ImageBackground
            source={require("../../assets/auth-decor.jpg")}
            resizeMode="cover"
            style={{ height: HERO_HEIGHT, width: "100%" }}
          >
            <View className="absolute inset-0 bg-black/50" />
            <View className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-transparent" />
            <View className="flex-1 justify-end pb-14 px-6">
              <Text className="text-white text-[34px] font-extrabold drop-shadow-lg">
                Create account
              </Text>
            </View>
          </ImageBackground>
          <Svg
            pointerEvents="none"
            width={SCREEN_WIDTH}
            height={60}
            style={{ position: "absolute", bottom: -24, left: 0 }}
            viewBox={`0 0 ${SCREEN_WIDTH} 60`}
          >
            <Path
              d={`M0 0 Q${SCREEN_WIDTH / 2} 26 ${SCREEN_WIDTH} 0 L${SCREEN_WIDTH} 60 L0 60 Z`}
              fill="white"
            />
          </Svg>
        </View>

          <View className="flex-1 px-6 pb-12 pt-10 -mt-8">
          <View>
            <View className="flex-row justify-center">
              <Pressable
                onPress={onGoogleButtonPress}
                disabled={isBusy}
                className="flex-1 max-w-[280px] h-[58px] border border-gray-200 rounded-full bg-white shadow-sm items-center justify-center active:bg-gray-50"
              >
                {googleLoading ? (
                  <ActivityIndicator />
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="logo-google" size={26} color="#DB4437" />
                    <Text className="text-base font-semibold text-gray-900">
                      Sign up with Google
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center my-8">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-gray-400 text-xs uppercase tracking-[0.25em]">
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="gap-6">
            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-2">
                DISPLAY NAME
              </Text>
              <TextInput
                ref={nameInputRef}
                className="h-[52px] rounded-[18px] border border-gray-200 px-4 text-gray-900 bg-[#fafafb]"
                style={{ paddingVertical: 0, textAlignVertical: "center" }}
                placeholder="How should we call you?"
                placeholderTextColor="#B8BEC8"
                autoCapitalize="words"
                returnKeyType="next"
                returnKeyLabel="›"
                blurOnSubmit={false}
                onSubmitEditing={() => emailInputRef.current?.focus()}
                onChangeText={setName}
                value={name}
                editable={!isBusy}
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-2">
                EMAIL ADDRESS <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                ref={emailInputRef}
                className="h-[52px] rounded-[18px] border border-gray-200 px-4 text-gray-900 bg-[#fafafb]"
                style={{ paddingVertical: 0, textAlignVertical: "center" }}
                placeholder="you@example.com"
                placeholderTextColor="#B8BEC8"
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
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-2">
                PASSWORD <Text className="text-red-500">*</Text>
              </Text>
              <View className="h-[52px] rounded-[18px] border border-gray-200 px-4 flex-row items-center bg-[#fafafb]">
                <TextInput
                  ref={passwordInputRef}
                  className="flex-1 text-gray-900"
                  style={{ paddingVertical: 0, textAlignVertical: "center" }}
                  placeholder="Create a password"
                  placeholderTextColor="#B8BEC8"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    passwordInputRef.current?.blur();
                    onEmailSignUp();
                  }}
                  onChangeText={setPassword}
                  value={password}
                  editable={!isBusy}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#9CA3AF"
                  />
                </Pressable>
              </View>
            </View>
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
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

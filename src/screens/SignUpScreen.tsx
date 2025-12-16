import React, { useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { AuthStackParamList } from "@/app/navigation/AuthStack";
import { useSignUp } from "@/domains/auth/hooks/useSignUp";
import { auth, firestore } from "@/configs/firebase";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignUp">;
};

export default function SignUpScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, loading: signUpLoading, error: signUpError, clearError } =
    useSignUp();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const isBusy = signUpLoading || googleLoading;
  const errorMsg = googleError || signUpError || "";

  const onGoogleButtonPress = async () => {
    setGoogleLoading(true);
    clearError();
    setGoogleError("");

    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();
      if (signInResult.type !== "success" || !signInResult.data?.idToken) {
        throw new Error("Google sign-in did not complete. Please try again.");
      }

      const { idToken, user: googleUser } = signInResult.data;
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      await setDoc(
        doc(firestore, "users", firebaseUser.uid),
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email || googleUser.email,
          displayName: firebaseUser.displayName || googleUser.name,
          photoURL: firebaseUser.photoURL || googleUser.photo,
          role: "art_lover",
          followerCount: 0,
          followingCount: 0,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setGoogleError("Google sign-in was cancelled.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setGoogleError("Google sign-in is already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setGoogleError("Google Play Services not available.");
      } else {
        console.error("Google sign-in failed:", error);
        setGoogleError(
          `Google sign-in failed: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const onEmailSignUp = () => {
    clearError();
    setGoogleError("");
    void signUp(name.trim() || undefined, email, password);
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ImageBackground
          source={require("../../assets/auth-decor.jpg")}
          resizeMode="cover"
          className="h-[260px] w-full"
        >
          <View className="absolute inset-0 bg-black/35" />
          <View className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-transparent" />
          <View className="flex-1 justify-end pb-12 px-6">
            <Text className="text-white text-4xl font-extrabold">
              Create account
            </Text>
          </View>
        </ImageBackground>

        <View className="-mt-6 rounded-t-3xl bg-white px-6 pb-10 pt-8">
          <Text className="text-center text-base text-gray-700 font-semibold mb-5">
            Sign up with email
          </Text>

          <Pressable
            onPress={onGoogleButtonPress}
            disabled={isBusy}
            className={`flex-row items-center justify-center gap-3 rounded-full py-3 px-4 shadow-sm border ${
              isBusy
                ? "bg-gray-100 border-gray-200 opacity-70"
                : "bg-white border-gray-300"
            }`}
          >
            {googleLoading ? (
              <ActivityIndicator />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text className="text-base font-semibold text-gray-900">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-3 text-gray-400 text-sm uppercase tracking-[0.2em]">
              OR
            </Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-xs font-semibold text-gray-600">
                DISPLAY NAME
              </Text>
              <TextInput
                className="mt-2 h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-900 bg-white"
                placeholder="How should we call you?"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                onChangeText={setName}
                value={name}
                editable={!signUpLoading && !googleLoading}
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-600">
                EMAIL ADDRESS <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="mt-2 h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-900 bg-white"
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                value={email}
                editable={!signUpLoading && !googleLoading}
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-gray-600">
                PASSWORD <Text className="text-red-500">*</Text>
              </Text>
              <View className="mt-2 h-12 rounded-xl border border-gray-200 px-4 flex-row items-center bg-white">
                <TextInput
                  className="flex-1 text-base text-gray-900"
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  onChangeText={setPassword}
                  value={password}
                  editable={!signUpLoading && !googleLoading}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {errorMsg ? (
            <Text className="text-red-500 text-sm mt-3">{errorMsg}</Text>
          ) : null}

          <Pressable
            className="mt-6 h-12 rounded-full bg-gray-900 items-center justify-center shadow-sm active:bg-black"
            onPress={onEmailSignUp}
            disabled={isBusy}
            className={`mt-6 h-12 rounded-full items-center justify-center shadow-sm ${
              isBusy ? "bg-gray-300" : "bg-gray-900 active:bg-black"
            }`}
          >
            {signUpLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Sign Up
              </Text>
            )}
          </Pressable>

          <Pressable
            className="mt-5 items-center"
            onPress={() => navigation.navigate("LogIn")}
            disabled={isBusy}
            className={`mt-5 items-center ${isBusy ? "opacity-60" : ""}`}
          >
            <Text className="text-sm text-gray-700">
              Already with Artium?{" "}
              <Text className="font-semibold text-gray-900">Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

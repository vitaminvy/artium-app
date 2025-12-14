import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  ImageBackground,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

import { AuthStackParamList } from "../app/navigation/AuthStack";

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { auth, firestore } from "../configs/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { doSignInWithEmailAndPassword } from "@/domains/auth/services/firebaseAuth";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "LogIn">;
};

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // The GoogleSignin.configure call has been moved to src/app/index.tsx
  // to ensure it only runs once when the app starts.

  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");

    try {
      await doSignInWithEmailAndPassword(email.trim(), password);
      // AuthContext's onAuthStateChanged will handle navigation when user is authenticated
    } catch (err: any) {
      let msg = "Sign-in failed";

      switch (err.code) {
        case "auth/user-not-found":
          msg = "Account not found";
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          msg = "Incorrect email or password";
          break;
        case "auth/invalid-email":
          msg = "Invalid email format";
          break;
        default:
          msg = err.message || msg;
          break;
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleButtonPress() {
    setLoading(true);
    setErrorMsg("");
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type !== "success" || !signInResult.data?.idToken) {
        throw new Error("Google sign-in did not complete. Please try again.");
      }
      const idToken = signInResult.data.idToken;
      const googleUser = signInResult.data.user; // Get the user info from the data object

      const googleCredential = GoogleAuthProvider.credential(idToken);

      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      await setDoc(
        doc(firestore, "users", firebaseUser.uid),
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email || googleUser.email, // Use Firebase user email, fallback to googleUser if null
          displayName: firebaseUser.displayName || googleUser.name, // Use Firebase user display name, fallback to googleUser
          photoURL: firebaseUser.photoURL || googleUser.photo, // Use Firebase user photo, fallback to googleUser
          createdAt: firebaseUser.metadata.creationTime,
          lastLoginAt: firebaseUser.metadata.lastSignInTime,
        },
        { merge: true }
      );

      // Login is now handled by the onAuthStateChanged listener in AuthContext.
      // The RootNavigator will automatically switch to the main app screen.
      // No reload or manual token management is needed.
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setErrorMsg("Google sign-in was cancelled.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setErrorMsg("Google sign-in is already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMsg("Google Play Services not available.");
      } else {
        console.error("Lỗi đăng nhập Google:", error);
        setErrorMsg(
          `Google sign-in failed: ${error.message || "Unknown error"}`
        );
      }
    } finally {
      setLoading(false); // Make sure to turn off loading here
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require("../../assets/auth-decor.jpg")}
        resizeMode="cover"
        className="h-[260px] w-full"
      >
        <View className="absolute inset-0 bg-black/35" />
        <View className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-transparent" />
        <View className="flex-1 justify-end pb-12 px-6">
          <Text className="text-white text-4xl font-extrabold">
            Welcome Back!
          </Text>
        </View>
      </ImageBackground>

      <View className="-mt-6 rounded-t-3xl bg-white px-6 pb-10 pt-8">
        <Text className="text-center text-base text-gray-700 font-semibold mb-5">
          Sign in with
        </Text>

        <Pressable
          onPress={onGoogleButtonPress}
          disabled={loading}
          className="flex-row items-center justify-center gap-3 border border-gray-300 rounded-full py-3 px-4 bg-white shadow-sm"
        >
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text className="text-base font-semibold text-gray-900">
            Continue with Google
          </Text>
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
              EMAIL ADDRESS <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="mt-2 h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-900 bg-white"
              placeholder="Enter email address"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
              editable={!loading}
            />
          </View>

          <View>
            <Text className="text-xs font-semibold text-gray-600">
              PASSWORD <Text className="text-red-500">*</Text>
            </Text>
            <View className="mt-2 h-12 rounded-xl border border-gray-200 px-4 flex-row items-center bg-white">
              <TextInput
                className="flex-1 text-base text-gray-900"
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
                editable={!loading}
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

        <Pressable
          className="mt-3 self-end"
          onPress={() => navigation.navigate("ForgotPassword")}
          disabled={loading}
        >
          <Text className="text-sm font-semibold text-gray-800">
            Forgot password?
          </Text>
        </Pressable>

        {errorMsg ? (
          <Text className="text-red-500 text-sm mt-2">{errorMsg}</Text>
        ) : null}

        <Pressable
          className="mt-5 h-12 rounded-full bg-[#1a73e8] items-center justify-center shadow-sm active:bg-[#125bc0]"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">Sign in</Text>
          )}
        </Pressable>

        <Pressable
          className="mt-5 items-center"
          onPress={() => navigation.navigate("SignUp")}
          disabled={loading}
        >
          <Text className="text-sm text-gray-700">
            Not yet on Artium?{" "}
            <Text className="font-semibold text-[#1a73e8]">Sign up</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

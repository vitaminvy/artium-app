import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  DevSettings,
  Platform,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";


import { tokenStorage } from "../domains/auth/services/tokenStorage";
import { AuthStackParamList } from "../app/navigation/AuthStack";

import { GoogleSignin, GoogleSigninButton, statusCodes } from "@react-native-google-signin/google-signin";
import { auth, firestore } from "../configs/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "LogIn">;
};

WebBrowser.maybeCompleteAuthSession();



export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // The GoogleSignin.configure call has been moved to src/app/index.tsx
  // to ensure it only runs once when the app starts.

  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");

    try {
      // Điều này cần được thay thế bằng logic đăng nhập bằng email/password thực tế của Firebase
      await tokenStorage.set("demo-token");
      DevSettings.reload();
    } catch (err: any) {
      let msg = "Login failed";

      switch (err.code) {
        case "auth/user-not-found":
          msg = "Account not found";
          break;
        case "auth/wrong-password":
          msg = "Wrong password";
          break;
        case "auth/invalid-email":
          msg = "Invalid email";
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
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      const signInResult = await GoogleSignin.signIn();

      if (signInResult.type !== "success" || !signInResult.data?.idToken) {
        throw new Error("Could not get idToken from Google or sign-in was not successful.");
      }
      const idToken = signInResult.data.idToken;
      const googleUser = signInResult.data.user; // Get the user info from the data object

      const googleCredential = GoogleAuthProvider.credential(idToken);

      const userCredential = await signInWithCredential(auth, googleCredential);
      const firebaseUser = userCredential.user;

      await setDoc(doc(firestore, "users", firebaseUser.uid), {
        uid: firebaseUser.uid,
        email: firebaseUser.email || googleUser.email, // Use Firebase user email, fallback to googleUser if null
        displayName: firebaseUser.displayName || googleUser.name, // Use Firebase user display name, fallback to googleUser
        photoURL: firebaseUser.photoURL || googleUser.photo, // Use Firebase user photo, fallback to googleUser
        createdAt: firebaseUser.metadata.creationTime,
        lastLoginAt: firebaseUser.metadata.lastSignInTime,
      }, { merge: true });

      // Login is now handled by the onAuthStateChanged listener in AuthContext.
      // The RootNavigator will automatically switch to the main app screen.
      // No reload or manual token management is needed.

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setErrorMsg("Đăng nhập Google bị hủy.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setErrorMsg("Đăng nhập Google đang trong tiến trình.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMsg("Google Play Services không khả dụng.");
      } else {
        console.error("Lỗi đăng nhập Google:", error);
        setErrorMsg(`Đăng nhập Google thất bại: ${error.message || "Không xác định"}`);
      }
    } finally {
      setLoading(false); // Make sure to turn off loading here
    }
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold mb-8 text-center">Sign In</Text>

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-2"
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {errorMsg ? (
        <Text className="text-red-500 text-sm mb-3">{errorMsg}</Text>
      ) : null}

      <Pressable
        className="bg-black py-4 rounded-xl items-center mt-2"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">Login</Text>
        )}
      </Pressable>

      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-3 text-gray-400 text-sm">or</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      <Pressable
        onPress={onGoogleButtonPress}
        disabled={loading}
        className="flex-row items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 mb-3"
      >
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text className="text-base font-semibold">Continue with Google</Text>
      </Pressable>

      {Platform.OS === "ios" ? (
        <Pressable
          disabled={loading}
          className="flex-row items-center justify-center gap-3 border border-gray-300 rounded-xl py-3"
        >
          <Ionicons name="logo-apple" size={20} color="#000" />
          <Text className="text-base font-semibold">Continue with Apple</Text>
        </Pressable>
      ) : null}

      <Pressable className="mt-5" onPress={() => navigation.navigate("SignUp")}>
        <Text className="text-gray-600 text-center">
          Don't have an account?{" "}
          <Text className="text-black font-semibold">Sign up now</Text>
        </Text>
      </Pressable>
    </View>
  );
}

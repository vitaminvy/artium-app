import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as WebBrowser from "expo-web-browser";

import { AuthStackParamList } from "../app/navigation/AuthStack";

import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { auth } from "../configs/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doSignInWithEmailAndPassword } from "@/domains/auth/services/firebaseAuth";
import { upsertUserProfile } from "@/domains/auth/services/userProfile";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "LogIn">;
};

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HERO_HEIGHT = 280;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  // The GoogleSignin.configure call has been moved to src/app/index.tsx
  // to ensure it only runs once when the app starts.

  async function handleLogin() {
    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

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
        case "auth/missing-password":
          msg = "Please enter your password.";
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

      await upsertUserProfile(firebaseUser, {
        email: firebaseUser.email || googleUser.email,
        displayName: firebaseUser.displayName || googleUser.name,
        photoURL: firebaseUser.photoURL || googleUser.photo,
      });

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
      } else if (error.code === "auth/network-request-failed") {
        setErrorMsg(
          "Network unavailable. Please check your connection and try again."
        );
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

  async function onAppleButtonPress() {
    // TODO: Implement Apple Sign-In
    // And configure Apple Sign-In in your Firebase project
    setErrorMsg("Apple sign-in is not yet implemented.");
  }

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
            <Pressable
              className="absolute left-4 top-12 h-10 w-10 items-center justify-center rounded-full bg-black/45"
              onPress={() => navigation.goBack()}
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </Pressable>
            <View className="absolute inset-0 bg-black/50" />
            <View className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-transparent" />
            <View className="flex-1 justify-end pb-14 px-6">
              <Text className="text-white text-[34px] font-extrabold drop-shadow-lg">
                Welcome Back!
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
          {/* Social Sign-In Section */}
          <View>
            <Text className="text-center text-gray-900 text-base font-medium mb-5">
              Sign in with
            </Text>

            <View className="flex-row justify-center gap-4">
              <Pressable
                onPress={onGoogleButtonPress}
                disabled={loading}
                className="flex-1 max-w-[170px] h-[58px] border border-gray-200 rounded-full bg-white shadow-sm items-center justify-center active:bg-gray-50"
              >
                <Ionicons name="logo-google" size={28} color="#DB4437" />
              </Pressable>

              <Pressable
                onPress={onAppleButtonPress}
                disabled={loading}
                className="flex-1 max-w-[170px] h-[58px] border border-gray-200 rounded-full bg-white shadow-sm items-center justify-center active:bg-gray-50"
              >
                <Ionicons name="logo-apple" size={28} color="#000000" />
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

          {/* Email/Password Form */}
          <View className="gap-6">
            <View>
              <Text className="text-xs font-semibold text-gray-600 mb-2">
                EMAIL ADDRESS <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                ref={emailInputRef}
                className="h-[52px] rounded-[18px] border border-gray-200 px-4 text-gray-900 bg-[#fafafb]"
                style={{ paddingVertical: 0, textAlignVertical: "center" }}
                placeholder="Enter email address"
                placeholderTextColor="#B8BEC8"
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                returnKeyLabel="›"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                onChangeText={setEmail}
                value={email}
                editable={!loading}
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
                  placeholder="Enter password"
                  placeholderTextColor="#B8BEC8"
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    passwordInputRef.current?.blur();
                    void handleLogin();
                  }}
                  onChangeText={setPassword}
                  value={password}
                  editable={!loading}
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

          {/* Sign In Button */}
          <Pressable
            className="mt-8 h-[50px] rounded-[14px] bg-[#2d74ed] items-center justify-center shadow-sm active:bg-[#2163d2]"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Sign in</Text>
            )}
          </Pressable>

          {/* Footer Links */}
          <Pressable
            className="mt-6 items-center"
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={loading}
          >
            <Text className="text-sm font-medium text-[#2b6fe8]">
              Forgot password?
            </Text>
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

          <Pressable
            className="mt-4 items-center"
            onPress={() => setErrorMsg("")}
            disabled={loading}
          >
            <Text className="text-xs text-gray-400">
              Need help?{" "}
              <Text className="font-semibold text-[#1a73e8]">
                Contact support
              </Text>
            </Text>
          </Pressable>
        </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

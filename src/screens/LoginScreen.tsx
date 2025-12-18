import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Linking,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import * as WebBrowser from "expo-web-browser";

import { AuthStackParamList } from "../app/navigation/AuthStack";
import { doSignInWithEmailAndPassword } from "@/domains/auth/services/firebaseAuth";
import { useGoogleAuth } from "@/domains/auth/hooks/useGoogleAuth";

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
  
  const { 
    signInWithGoogle, 
    loading: googleLoading, 
    error: googleError 
  } = useGoogleAuth();

  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const isBusy = loading || googleLoading;
  const displayError = errorMsg || googleError;

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

  const handleContactSupport = () => {
    const email = "artium.support@artium.com";
    const subject = "Artium Support";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    Linking.openURL(mailtoUrl).catch((err) => {
      console.error("Failed to open mail app:", err);
      setErrorMsg("Unable to open mail app.");
    });
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
            <View className="flex-row justify-center">
              <Pressable
                onPress={() => signInWithGoogle()}
                disabled={isBusy}
                className="flex-1 max-w-[280px] h-[58px] border border-gray-200 rounded-full bg-white shadow-sm items-center justify-center active:bg-gray-50"
              >
                {googleLoading ? (
                  <ActivityIndicator />
                ) : (
                  <View className="flex-row items-center justify-center gap-2">
                    <Ionicons name="logo-google" size={26} color="#DB4437" />
                    <Text className="text-base font-semibold text-gray-900">
                      Sign in with Google
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

          {displayError ? (
            <Text className="text-red-500 text-xs mt-2">{displayError}</Text>
          ) : null}

          {/* Sign In Button */}
          <Pressable
            className="mt-8 h-[50px] rounded-[14px] bg-[#2d74ed] items-center justify-center shadow-sm active:bg-[#2163d2]"
            onPress={handleLogin}
            disabled={isBusy}
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
            disabled={isBusy}
          >
            <Text className="text-sm font-medium text-[#2b6fe8]">
              Forgot password?
            </Text>
          </Pressable>

          <Pressable
            className="mt-5 items-center"
            onPress={() => navigation.navigate("SignUp")}
            disabled={isBusy}
          >
            <Text className="text-sm text-gray-700">
              Not yet on Artium?{" "}
              <Text className="font-semibold text-[#1a73e8]">Sign up</Text>
            </Text>
          </Pressable>

          <Pressable
            className="mt-4 items-center"
            onPress={handleContactSupport}
            disabled={isBusy}
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

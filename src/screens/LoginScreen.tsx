import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as WebBrowser from "expo-web-browser";

import { AuthStackParamList } from "../app/navigation/AuthStack";
import { doSignInWithEmailAndPassword } from "@/domains/auth/services/firebaseAuth";
import { useGoogleAuth } from "@/domains/auth/hooks/useGoogleAuth";
import AuthScreenLayout from "@/shared/components/auth/AuthScreenLayout";
import AuthGoogleButton from "@/shared/components/auth/AuthGoogleButton";
import AuthAppleButton from "@/shared/components/auth/AuthAppleButton";
import AuthDivider from "@/shared/components/auth/AuthDivider";
import AuthTextField from "@/shared/components/auth/AuthTextField";
import AuthPasswordField from "@/shared/components/auth/AuthPasswordField";

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

  const { signInWithGoogle, loading: googleLoading, error: googleError } =
    useGoogleAuth();

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

  // TODO: Implement Apple Sign In
  const handleAppleSignIn = () => {
    setErrorMsg("Apple Sign In is coming soon!");
  };

  return (
    <AuthScreenLayout title="Welcome Back!">
      {/* Social Sign-In Section */}
      <View className="flex-row gap-3">
        <AuthGoogleButton
          label="Google"
          onPress={() => signInWithGoogle()}
          loading={googleLoading}
          disabled={isBusy}
        />
        <AuthAppleButton
          label="Apple"
          onPress={handleAppleSignIn}
          disabled={isBusy}
        />
      </View>

      <AuthDivider />

      {/* Email/Password Form */}
      <View className="gap-6">
        <AuthTextField
          label="EMAIL ADDRESS"
          required
          inputRef={emailInputRef}
          placeholder="Enter email address"
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
          placeholder="Enter password"
          returnKeyType="done"
          onSubmitEditing={() => {
            passwordInputRef.current?.blur();
            void handleLogin();
          }}
          onChangeText={setPassword}
          value={password}
          editable={!isBusy}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
        />
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
          <Text className="font-semibold text-[#1a73e8]">Contact support</Text>
        </Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

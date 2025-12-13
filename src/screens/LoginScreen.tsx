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
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { tokenStorage } from "../domains/auth/services/tokenStorage";
import { AuthStackParamList } from "../app/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "LogIn">;
};

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_IDS = {
  clientId: "REPLACE_WITH_EXPO_GO_WEB_CLIENT_ID.apps.googleusercontent.com", // dùng cho Expo Go/proxy
  iosClientId:
    "300008030002-39obokvd8jlv0k7pklb39h9vum8outmu.apps.googleusercontent.com",
  androidClientId: "REPLACE_WITH_ANDROID_CLIENT_ID.apps.googleusercontent.com",
  webClientId: "REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com",
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const redirectUri = makeRedirectUri({
    // native schema phải trùng với app.json (bundleIdentifier) nếu dùng dev client
    native: "com.artium.app:/oauthredirect",
  });

  const [googleRequest, googleResponse, promptGoogle] =
    Google.useIdTokenAuthRequest({
      clientId: GOOGLE_CLIENT_IDS.clientId,
      iosClientId: GOOGLE_CLIENT_IDS.iosClientId,
      androidClientId: GOOGLE_CLIENT_IDS.androidClientId,
      webClientId: GOOGLE_CLIENT_IDS.webClientId,
      redirectUri,
    });

  async function handleLogin() {
    setLoading(true);
    setErrorMsg("");

    try {
      // Demo login: store token and reload to pick up authenticated flow
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
      }

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialLogin(provider: "google" | "apple") {
    if (provider === "google") {
      setErrorMsg("");
      setLoading(true);
      if (!googleRequest) {
        setLoading(false);
        setErrorMsg("Google Sign-In chưa sẵn sàng");
        return;
      }
      const result = await promptGoogle();
      // If canceled, stop loading
      if (!result || result.type !== "success") {
        setLoading(false);
      }
      return;
    }
    // TODO: integrate Apple OAuth (expo-apple-authentication or AuthSession)
  }

  useEffect(() => {
    if (googleResponse?.type === "success") {
      const idToken = googleResponse.params?.id_token;
      if (idToken) {
        tokenStorage.set(idToken).then(() => DevSettings.reload());
      } else {
        setLoading(false);
        setErrorMsg("Could not retrieve Google token");
      }
    } else if (googleResponse?.type) {
      setLoading(false);
    }
  }, [googleResponse]);

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
        onPress={() => handleSocialLogin("google")}
        disabled={loading}
        className="flex-row items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 mb-3"
      >
        <Ionicons name="logo-google" size={20} color="#DB4437" />
        <Text className="text-base font-semibold">Continue with Google</Text>
      </Pressable>

      {Platform.OS === "ios" ? (
        <Pressable
          onPress={() => handleSocialLogin("apple")}
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

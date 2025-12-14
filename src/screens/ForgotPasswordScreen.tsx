import { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { forgotPassword } from "@/domains/auth/services/forgotPassword";
import { AuthStackParamList } from "@/app/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "ForgotPassword">;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setErrorMsg("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      await forgotPassword(email);

      Alert.alert(
        "Email sent",
        "Check your inbox for reset instructions.",
        [
          {
            text: "Back to sign in",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      setErrorMsg(error?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
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
          className="h-[320px] w-full"
        >
          <View className="absolute inset-0 bg-black/40" />
          <View className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/15" />
          <View className="flex-1 justify-end px-6 pb-10">
            <Text className="text-white text-4xl font-extrabold leading-tight">
              Forgot{"\n"}password
            </Text>
            <Text className="text-white/90 text-base mt-3 leading-6">
              Confirm your account email so we can send reset instructions.
            </Text>
          </View>
        </ImageBackground>

        <View className="flex-1 px-6 pt-6">
          <View className="mb-5">
            <Text className="text-sm text-gray-500 font-semibold">
              EMAIL ADDRESS
            </Text>
            <TextInput
              className="mt-2 h-12 rounded-xl border border-gray-200 px-4 text-base text-gray-900 bg-white"
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
              editable={!loading}
            />
          </View>

          {errorMsg ? (
            <Text className="text-red-500 text-sm mb-3">{errorMsg}</Text>
          ) : null}

          <Pressable
            onPress={handleResetPassword}
            disabled={loading}
            className="mt-4 h-12 rounded-full bg-gray-900 items-center justify-center"
          >
            <Text className="text-white text-base font-semibold">
              {loading ? "Sending..." : "Send"}
            </Text>
          </Pressable>

          <Pressable
            className="mt-6 items-center"
            onPress={() => navigation.navigate("SignUp")}
            disabled={loading}
          >
            <Text className="text-sm text-gray-700">
              Still new? <Text className="font-semibold">Sign Up</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

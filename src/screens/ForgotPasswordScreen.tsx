import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { forgotPassword } from "@/domains/auth/services/forgotPassword";
import { AuthStackParamList } from "@/app/navigation/AuthStack";
import AuthScreenLayout from "@/shared/components/auth/AuthScreenLayout";
import AuthTextField from "@/shared/components/auth/AuthTextField";

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
      const code = error?.code;
      if (code === "auth/invalid-email") {
        setErrorMsg("Please enter a valid email address.");
      } else if (code === "auth/user-not-found") {
        setErrorMsg("No account found for this email.");
      } else {
        setErrorMsg("Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      title={"Forgot\npassword"}
      subtitle="Confirm your account email so we can send reset instructions."
    >
      <View className="gap-5">
        <AuthTextField
          label="EMAIL ADDRESS"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
          editable={!loading}
        />

        {errorMsg ? (
          <Text className="text-red-500 text-xs">{errorMsg}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleResetPassword}
        disabled={loading}
        className={`mt-8 h-[50px] rounded-[14px] items-center justify-center shadow-sm ${
          loading ? "bg-[#bcd3f6]" : "bg-[#2d74ed] active:bg-[#2163d2]"
        }`}
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
          Still new? <Text className="font-semibold text-[#1a73e8]">Sign Up</Text>
        </Text>
      </Pressable>
    </AuthScreenLayout>
  );
}

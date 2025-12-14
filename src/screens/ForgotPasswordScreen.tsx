import { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { forgotPassword } from "@/domains/auth/services/forgotPassword";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setLoading(true);
      await forgotPassword(email);

      Alert.alert(
        "Thành công",
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư."
      );

      navigation.goBack(); // quay về Login
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 12 }}>
        Nhập email để nhận link đặt lại mật khẩu
      </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 16,
        }}
      />

      <Pressable onPress={handleResetPassword} disabled={loading}>
        <Text>{loading ? "Đang gửi..." : "Gửi email reset"}</Text>
      </Pressable>
    </View>
  );
}

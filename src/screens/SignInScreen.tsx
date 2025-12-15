import { View, Text, Pressable } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { tokenStorage } from "../domains/auth/services/tokenStorage";
import { AuthStackParamList } from "../app/navigation/AuthStack";

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, "SignIn">;
};

export default function SignInScreen({ navigation }: Props) {
  async function handleLogin() {
    await tokenStorage.set("demo-token");
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  }

  return (
    <View style={{ padding: 30 }}>
      <Text>Sign In Screen</Text>
      <Pressable onPress={handleLogin}>
        <Text>Đăng nhập</Text>
      </Pressable>
    </View>
  );
}

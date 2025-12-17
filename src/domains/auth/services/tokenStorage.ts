import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Simple token storage that tries SecureStore first and falls back to AsyncStorage.
export const tokenStorage = {
  get: async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      return token ?? (await AsyncStorage.getItem("token"));
    } catch (err) {
      return null;
    }
  },

  set: async (token: string) => {
    await SecureStore.setItemAsync("token", token);
    await AsyncStorage.setItem("token", token);
  },

  remove: async () => {
    await SecureStore.deleteItemAsync("token");
    await AsyncStorage.removeItem("token");
  },
};

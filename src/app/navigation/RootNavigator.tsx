import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, ScrollView, Text, View } from "react-native";

import ArtworkDetailScreen from "../../screens/ArtworkDetailScreen";
import LoginScreen from "../../screens/LoginScreen";
import UploadScreen from "../../screens/UploadScreen";
import TabNavigator from "./TabNavigator";

type RootStackParamList = {
  DevMenu: undefined;
  Tabs: { screen?: string; params?: any } | undefined;
  ArtworkDetail: { id?: string };
  Login: undefined;
  Upload: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function DevMenu({ navigation }: any) {
  const links: Array<{
    label: string;
    action: () => void;
    hint?: string;
  }> = [
    {
      label: "Open Tabs (Home)",
      hint: "Home | Discover | Chat | Profile",
      action: () => navigation.navigate("Tabs", { screen: "Home" }),
    },
    {
      label: "Open Discover tab",
      action: () => navigation.navigate("Tabs", { screen: "Discover" }),
    },
    {
      label: "Open Chat tab",
      action: () => navigation.navigate("Tabs", { screen: "Chat" }),
    },
    {
      label: "Open Profile tab",
      action: () => navigation.navigate("Tabs", { screen: "Profile" }),
    },
    {
      label: "Artwork Detail (id:123)",
      action: () => navigation.navigate("ArtworkDetail", { id: "123" }),
      hint: "Direct push on root stack",
    },
    {
      label: "Login (standalone)",
      action: () => navigation.navigate("Login"),
    },
    {
      label: "Upload (standalone)",
      action: () => navigation.navigate("Upload"),
    },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="py-12 px-6 gap-4">
        <View className="gap-2 mb-4">
          <Text className="text-sm font-semibold text-slate-500">DEV SANDBOX</Text>
          <Text className="text-3xl font-bold text-slate-900">Artium Internal Structure</Text>
          <Text className="text-base text-slate-600">
            Quick links to test the screens you built in src/.
          </Text>
        </View>

        {links.map((link) => (
          <Pressable
            key={link.label}
            onPress={link.action}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-4 active:bg-slate-50"
          >
            <Text className="text-lg font-semibold text-blue-600">{link.label}</Text>
            {link.hint ? (
              <Text className="text-sm text-slate-500">{link.hint}</Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="DevMenu"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="DevMenu"
          component={DevMenu}
          options={{ title: "Dev Menu" }}
        />
        <Stack.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ArtworkDetail"
          component={ArtworkDetailScreen}
          options={{ title: "Artwork Detail" }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

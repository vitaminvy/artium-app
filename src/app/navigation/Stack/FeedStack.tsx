// Stack navigator for Feed flow
// src/app/navigation/Stack/FeedStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedScreen from "../../../screens/FeedScreen";

export type FeedStackParamList = {
  FeedMain: undefined;
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedMain" component={FeedScreen} />
    </Stack.Navigator>
  );
}

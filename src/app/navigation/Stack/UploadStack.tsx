// Stack navigator for Upload/Creation flow
// src/app/navigation/Stack/UploadStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UploadScreen from "../../../screens/UploadScreen"; // bạn tạo sau

export type UploadStackParamList = {
  UploadMain: undefined;
};

const Stack = createNativeStackNavigator<UploadStackParamList>();

export default function UploadStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UploadMain" component={UploadScreen} />
    </Stack.Navigator>
  );
}
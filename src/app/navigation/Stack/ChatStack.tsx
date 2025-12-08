// Stack navigator for Chat/Messaging flow
// src/app/navigation/Stack/ChatStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChatScreen from "../../../screens/ChatScreen";

export type ChatStackParamList = {
  ChatMain: undefined;
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatMain" component={ChatScreen} />
    </Stack.Navigator>
  );
}

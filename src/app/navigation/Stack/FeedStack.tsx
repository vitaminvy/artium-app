// Stack navigator for Feed flow
// src/app/navigation/Stack/FeedStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedScreen from "../../../screens/FeedScreen";
import FeedDetailScreen from "../../../screens/FeedDetailScreen";
import UserProfileScreen from "../../../screens/UserProfileScreen";
import { FeedPost } from "../../../domains/feed/types";

export type FeedStackParamList = {
  FeedMain: undefined;
  FeedDetail: { post: FeedPost };
  UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedMain" component={FeedScreen} />
      <Stack.Screen name="FeedDetail" component={FeedDetailScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
    </Stack.Navigator>
  );
}

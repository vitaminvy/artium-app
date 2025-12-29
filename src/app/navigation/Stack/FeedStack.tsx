// Stack navigator for Feed flow
// src/app/navigation/Stack/FeedStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FeedScreen from "../../../screens/FeedScreen";
import FeedDetailScreen from "../../../screens/FeedDetailScreen";
import BlogScreen from "../../../screens/BlogScreen";
import BlogDetailScreen from "../../../screens/BlogDetailScreen";
import { FeedPost } from "../../../domains/feed/types";

export type FeedStackParamList = {
  FeedMain: { refreshKey?: number } | undefined;
  FeedDetail: { post: FeedPost };
  Blog: undefined;
  BlogDetail: { blogId: string };
};

const Stack = createNativeStackNavigator<FeedStackParamList>();

export default function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedMain" component={FeedScreen} />
      <Stack.Screen name="FeedDetail" component={FeedDetailScreen} />
      <Stack.Screen name="Blog" component={BlogScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
    </Stack.Navigator>
  );
}

import "./global.css";
import { LogBox } from "react-native";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import AppEntry from "./src/app";

// Ensure error handler is registered once
LogBox.ignoreAllLogs(false);
if (typeof ErrorUtils !== "undefined") {
  ErrorUtils.setGlobalHandler((err, isFatal) => {
    console.error(
      "GlobalError message:",
      err?.message,
      "\nstack:",
      err?.stack,
      "\ncomponentStack:",
      (err as any)?.componentStack,
      "\nraw:",
      err,
      "\nisFatal:",
      isFatal
    );
    throw err;
  });
}

export default function App() {
  // Also log from component to catch render-time issues
  useEffect(() => {
    console.log("App mounted");
  }, []);
  // State để kiểm tra xem user đã bấm "Enter App" chưa
  const [isAppEntered, setIsAppEntered] = useState(false);

  // Nếu đã vào app, render code từ folder src/
  if (isAppEntered) {
    return <AppEntry />;
  }

  // Landing Page tạm thời
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <View className="items-center px-6">
        <Text className="text-4xl font-bold text-slate-800 mb-2">ARTIUM</Text>
        <Text className="text-center text-gray-500 mb-8">
          Landing Page Placeholder
        </Text>

        <TouchableOpacity
          onPress={() => setIsAppEntered(true)}
          className="bg-black py-4 px-8 rounded-full shadow-lg active:opacity-80"
        >
          <Text className="text-white font-bold text-lg">
            Go to Development App →
          </Text>
        </TouchableOpacity>

        <Text className="mt-10 text-xs text-gray-400">
          Click above to test components in src/
        </Text>
      </View>
    </SafeAreaView>
  );
}

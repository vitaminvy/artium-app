import "./global.css";
import { LogBox, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import AppEntry from "./src/app";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

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

// Tắt strict warning của Reanimated (đọc shared value trong render)
// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default (is true --> has set to false)
});

export default function App() {
  // Also log from component to catch render-time issues
  useEffect(() => {
    console.log("App mounted");
  }, []);
  // Luôn vào app chính (Welcome/Auth) ngay từ đầu
  return <AppEntry />;
}

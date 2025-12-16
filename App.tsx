import "./global.css";
import { LogBox, Image, Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import AppEntry from "./src/app";
import { useAuthBootstrap } from "./src/domains/auth/hooks/useAuthBootstrap";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

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
  const auth = useAuthBootstrap();
  const [splashTimerDone, setSplashTimerDone] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;
  const slideUp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => setSplashTimerDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Khi hết timer và auth đã xong, animate splash ra và bỏ khỏi cây
  useEffect(() => {
    if (!splashTimerDone || auth.status === "loading") return;

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: -40,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => setSplashVisible(false));
  }, [splashTimerDone, auth.status, fade, slideUp]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AppEntry authStatus={auth.status} />

        {splashVisible && (
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: "white",
                alignItems: "center",
                justifyContent: "center",
                opacity: fade,
                transform: [{ translateY: slideUp }],
              },
            ]}
          >
            <SafeAreaView
              style={{
                flex: 1,
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("./assets/logos/logo-full-text-light-mode.png")}
                resizeMode="contain"
                style={{ width: 240, height: 90 }}
              />
            </SafeAreaView>
          </Animated.View>
        )}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

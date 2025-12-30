import React, { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArtworkDetailScreen from "../../screens/ArtworkDetailScreen";
import UploadInventoryScreen from "../../screens/UploadInventoryScreen";
import CheckoutScreen from "../../screens/CheckoutScreen";
import NotificationsScreen from "../../screens/NotificationsScreen";
import TabNavigator from "./TabNavigator";
import { TabParamList } from "./tabTypes";
import AuthStack from "./AuthStack";
import { AuthStatus } from "../../domains/auth/types";
import { navigationRef } from "./navigationRef";
import type { ArtworkDetail } from "../../domains/artwork/types";
import { getInvoiceIdByOrderCode } from "../../domains/invoices/services/invoicePaymentService";

type AppStackParamList = {
  Tabs: { screen?: keyof TabParamList; params?: TabParamList[keyof TabParamList] } | undefined;
  ArtworkDetail: { id?: string };
  Checkout: { artwork?: ArtworkDetail };
  Upload: undefined;
  Notifications: undefined;
};

type RootNavigatorProps = {
  authStatus: AuthStatus;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

function AppStack() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ArtworkDetail"
        component={ArtworkDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Upload"
        component={UploadInventoryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator({ authStatus }: RootNavigatorProps) {
  const [navReady, setNavReady] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);

  const handlePayosUrl = useCallback(
    async (url?: string | null) => {
      if (!url) return;
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch (err) {
        console.warn("Invalid deep link URL", err);
        return;
      }

      const path = `${parsed.host}${parsed.pathname}`;
      const isPayosReturn = path.includes("payos/return");
      const isPayosCancel = path.includes("payos/cancel");
      if (!isPayosReturn && !isPayosCancel) return;

      if (authStatus !== "authenticated" || !navigationRef.isReady()) {
        pendingUrlRef.current = url;
        return;
      }

      const invoiceId = parsed.searchParams.get("invoiceId");
      const orderCode = parsed.searchParams.get("orderCode");
      const resolvedInvoiceId =
        invoiceId || (orderCode ? await getInvoiceIdByOrderCode(orderCode) : null);

      if (!resolvedInvoiceId) {
        console.warn("Invoice not found for PayOS redirect", {
          invoiceId,
          orderCode,
        });
        return;
      }

      navigationRef.navigate("Tabs", {
        screen: "Home",
        params: {
          screen: "InvoiceDetail",
          params: { invoiceId: resolvedInvoiceId },
        },
      });
    },
    [authStatus]
  );

  useEffect(() => {
    let active = true;
    Linking.getInitialURL().then((url) => {
      if (!active) return;
      void handlePayosUrl(url);
    });
    const subscription = Linking.addEventListener("url", ({ url }) => {
      void handlePayosUrl(url);
    });
    return () => {
      active = false;
      subscription.remove();
    };
  }, [handlePayosUrl]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !navReady) return;
    if (!pendingUrlRef.current) return;
    const pendingUrl = pendingUrlRef.current;
    pendingUrlRef.current = null;
    void handlePayosUrl(pendingUrl);
  }, [authStatus, handlePayosUrl, navReady]);

  return (
    <NavigationContainer ref={navigationRef} onReady={() => setNavReady(true)}>
      {authStatus === "authenticated" ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

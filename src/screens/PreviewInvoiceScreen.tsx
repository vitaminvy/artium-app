import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import type { Invoice } from "../domains/invoices/types";
import {
  getInvoiceById,
  markInvoiceSent,
  updateInvoice,
} from "../domains/invoices/services/invoiceService";
import EventHeader from "../domains/events/components/ui/EventHeader";
import { SectionCard } from "../domains/inventory/components/ui/SectionCard";
import Sidebar from "../shared/components/Sidebar";
import {
  SidebarActionKey,
  SidebarKey,
  useSidebarItems,
} from "../shared/hooks/useSidebar";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";
import { useLogout } from "../domains/auth/hooks/useLogout";
import { LogoutConfirmModal } from "../domains/auth/components/LogoutConfirmModal";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "PreviewInvoice"
>;

type RouteParams = { invoiceId: string };

const formatCurrency = (amount: number, currency: string) => {
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${amount.toFixed(2)}`;
};

const formatInvoiceNumber = (id: string) => {
  const prefix = id.slice(0, 4).toUpperCase();
  const suffix = id.slice(-8).toUpperCase();
  return `IV-${prefix}-${suffix}`;
};

export default function PreviewInvoiceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { invoiceId } = route.params as RouteParams;
  const items = useSidebarItems();
  const { setHidden } = useTabBarVisibility();
  const {
    logout,
    loading: logoutLoading,
    showConfirmModal,
    onConfirmLogout,
    onCancelLogout,
  } = useLogout();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"save" | "send" | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<SidebarKey>("invoices");
  const [headerHeight, setHeaderHeight] = useState(96);

  useFocusEffect(
    useCallback(() => {
      setHidden(true);
      setActiveKey("invoices");
      return () => setHidden(false);
    }, [setHidden, setActiveKey])
  );

  useEffect(() => {
    setHidden(true);
    return () => setHidden(false);
  }, [setHidden]);

  useEffect(() => {
    const loadInvoice = async () => {
      setLoading(true);
      try {
        const data = await getInvoiceById(invoiceId);
        setInvoice(data);
      } catch (err) {
        console.error("Failed to load invoice:", err);
        Alert.alert("Invoice not found", "Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadInvoice();
  }, [invoiceId]);

  const handleSave = useCallback(async () => {
    setBusyAction("save");
    try {
      await updateInvoice(invoiceId, {});
      navigation.navigate("Invoices");
    } catch (err) {
      console.error("Failed to save invoice:", err);
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setBusyAction(null);
    }
  }, [invoiceId, navigation]);

  const handleSend = useCallback(async () => {
    setBusyAction("send");
    try {
      await markInvoiceSent(invoiceId);
      navigation.navigate("Invoices");
    } catch (err) {
      console.error("Failed to send invoice:", err);
      Alert.alert("Send failed", "Please try again.");
    } finally {
      setBusyAction(null);
    }
  }, [invoiceId, navigation]);

  const handleSidebarSelect = (key: SidebarActionKey) => {
    setSidebarOpen(false);

    if (key === "logout") {
      logout();
      return;
    }

    if (key === "home") {
      if (navigation.popToTop) {
        navigation.popToTop();
      } else {
        navigation.navigate("HomeMain");
      }
      return;
    }

    if (key === "inventory") {
      navigation.navigate("Inventory");
      return;
    }

    if (key === "profile") {
      navigation.navigate("Profile");
      return;
    }

    if (key === "events") {
      navigation.navigate("Events");
      return;
    }

    if (key === "invoices") {
      navigation.navigate("Invoices");
      return;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-sm text-slate-500">Invoice not available.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <EventHeader
        title="PREVIEW INVOICE"
        onPressBack={() => navigation.goBack()}
        onPressSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Math.max(insets.bottom + 160, 200),
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-center text-xs tracking-[2px] text-slate-400">
          THIS IS WHAT YOUR BUYER WILL SEE
        </Text>

        <SectionCard
          title={`Invoice #${invoice.invoiceNumber || formatInvoiceNumber(invoice.id)}`}
        >
          <View className="gap-4">
            <View className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-xs font-semibold text-slate-500 uppercase">
                From
              </Text>
              <Text className="mt-2 text-base font-semibold text-slate-900">
                {invoice.sellerSnapshot?.displayName || "Seller"}
              </Text>
            </View>
            <View className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-xs font-semibold text-slate-500 uppercase">
                To
              </Text>
              <Text className="mt-2 text-base font-semibold text-slate-900">
                {invoice.buyer?.name || "Buyer"}
              </Text>
              <Text className="text-sm text-slate-500">
                {invoice.buyer?.email}
              </Text>
            </View>
            <View className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-xs font-semibold text-slate-500 uppercase">
                Items
              </Text>
              <View className="mt-3 gap-3">
                {invoice.items.map((item, index) => (
                  <View
                    key={`${item.title}-${index}`}
                    className="flex-row items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                  >
                    <View className="h-14 w-14 rounded-xl overflow-hidden bg-slate-100">
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={{ height: "100%", width: "100%" }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={0}
                        />
                      ) : null}
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-slate-900">
                        {item.title}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-1">
                        Qty {item.quantity} ·{" "}
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View className="rounded-2xl border border-slate-200 bg-white p-4">
              <Text className="text-xs font-semibold text-slate-500 uppercase">
                Order summary
              </Text>
              <View className="mt-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-slate-600">Subtotal</Text>
                  <Text className="text-sm font-semibold text-slate-900">
                    {formatCurrency(invoice.totals.subtotal, invoice.currency)}
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="text-base font-semibold text-slate-900">
                    Total
                  </Text>
                  <Text className="text-base font-semibold text-slate-900">
                    {formatCurrency(invoice.totals.total, invoice.currency)}
                  </Text>
                </View>
              </View>
            </View>
            {invoice.buyer?.message ? (
              <View className="rounded-2xl border border-slate-200 bg-white p-4">
                <Text className="text-xs font-semibold text-slate-500 uppercase">
                  Note
                </Text>
                <Text className="mt-2 text-sm text-slate-600">
                  {invoice.buyer.message}
                </Text>
              </View>
            ) : null}
          </View>
        </SectionCard>
      </ScrollView>

      <View
        className="border-t border-slate-200 bg-white px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleSave}
            disabled={busyAction !== null}
            className="flex-1 rounded-full border border-slate-200 py-3 items-center"
          >
            <Text className="text-sm font-semibold text-slate-700">Save</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowPayment(true)}
            className="flex-1 rounded-full bg-[#0B73FF] py-3 items-center"
          >
            <Text className="text-sm font-semibold text-white">
              Collect Payment
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={handleSend}
          disabled={busyAction !== null}
          className={`mt-3 rounded-full py-3 items-center ${
            busyAction === "send" ? "bg-slate-200" : "bg-[#0B73FF]"
          }`}
        >
          <Text className="text-sm font-semibold text-white">Send</Text>
        </Pressable>
      </View>

      <Modal
        visible={showPayment}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayment(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="rounded-t-3xl bg-white p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-900">
                Coming soon
              </Text>
              <Pressable onPress={() => setShowPayment(false)}>
                <Ionicons name="close" size={20} color="#0F172A" />
              </Pressable>
            </View>
            <Text className="mt-3 text-sm text-slate-600">
              Payment collection will be available in a future update.
            </Text>
            <Pressable
              onPress={() => setShowPayment(false)}
              className="mt-5 h-[44px] items-center justify-center rounded-full bg-slate-900"
            >
              <Text className="text-sm font-semibold text-white">Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Sidebar
        visible={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleSidebarSelect}
        topOffset={headerHeight}
        activeKey={activeKey}
        items={items}
      />

      <LogoutConfirmModal
        visible={showConfirmModal}
        onConfirm={onConfirmLogout}
        onCancel={onCancelLogout}
        loading={logoutLoading}
      />
    </View>
  );
}

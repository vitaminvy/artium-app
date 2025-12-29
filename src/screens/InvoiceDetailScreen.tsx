import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import type { Invoice } from "../domains/invoices/types";
import {
  getInvoiceById,
  markInvoiceSent,
  updateInvoice,
} from "../domains/invoices/services/invoiceService";

type NavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  "InvoiceDetail"
>;

type RouteParams = { invoiceId: string };

const formatCurrency = (amount: number, currency: string) => {
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${amount.toFixed(2)}`;
};

export default function InvoiceDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { invoiceId } = route.params as RouteParams;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<"save" | "send" | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const loadInvoice = useCallback(async () => {
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
  }, [invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const titleLabel = useMemo(() => {
    if (!invoiceId) return "Invoice";
    const suffix = invoiceId.slice(-8).toUpperCase();
    return `Invoice #${suffix}`;
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
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
        <Text className="ml-3 text-base font-semibold text-slate-900">
          Preview Invoice
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Math.max(insets.bottom + 140, 180),
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-center text-xs tracking-[2px] text-slate-400">
          THIS IS WHAT YOUR BUYER WILL SEE
        </Text>
        <View className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <Text className="text-2xl font-semibold text-slate-900">
            {titleLabel}
          </Text>
          <View className="mt-5 gap-4">
            <View className="rounded-2xl border border-slate-100 p-4">
              <Text className="text-xs font-semibold text-slate-400">FROM</Text>
              <Text className="mt-2 text-sm font-semibold text-slate-900">
                {invoice.sellerSnapshot?.displayName || "Seller"}
              </Text>
            </View>
            <View className="rounded-2xl border border-slate-100 p-4">
              <Text className="text-xs font-semibold text-slate-400">TO</Text>
              <Text className="mt-2 text-sm font-semibold text-slate-900">
                {invoice.buyer?.name || "Buyer"}
              </Text>
              <Text className="text-xs text-slate-500">
                {invoice.buyer?.email}
              </Text>
            </View>
            <View className="rounded-2xl border border-slate-100 p-4">
              <Text className="text-xs font-semibold text-slate-400">ITEMS</Text>
              <View className="mt-3 gap-3">
                {invoice.items.map((item, index) => (
                  <View
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-slate-100 px-3 py-2"
                  >
                    <Text className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </Text>
                    <Text className="text-xs text-slate-500 mt-1">
                      Qty {item.quantity} ·{" "}
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View className="rounded-2xl border border-slate-100 p-4">
              <Text className="text-xs font-semibold text-slate-400">
                ORDER SUMMARY
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
              <View className="rounded-2xl border border-slate-100 p-4">
                <Text className="text-xs font-semibold text-slate-400">
                  NOTE
                </Text>
                <Text className="mt-2 text-sm text-slate-600">
                  {invoice.buyer.message}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-4 py-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleSave}
            disabled={busyAction !== null}
            className="flex-1 h-[46px] items-center justify-center rounded-full border border-slate-200"
          >
            <Text className="text-sm font-semibold text-slate-700">Save</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowPayment(true)}
            className="flex-1 h-[46px] items-center justify-center rounded-full bg-blue-600"
          >
            <Text className="text-sm font-semibold text-white">
              Collect Payment
            </Text>
          </Pressable>
        </View>
        <Pressable
          onPress={handleSend}
          disabled={busyAction !== null}
          className={`mt-3 h-[46px] items-center justify-center rounded-full ${
            busyAction === "send" ? "bg-blue-200" : "bg-blue-600"
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
    </View>
  );
}

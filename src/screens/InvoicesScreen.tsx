import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { useInvoices } from "../domains/invoices/hooks/useInvoices";
import type { Invoice } from "../domains/invoices/types";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Invoices">;

const formatCurrency = (amount: number, currency: string) => {
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${amount.toFixed(2)}`;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString();
};

export default function InvoicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { invoices, loading, error, refresh, sendInvoice } = useInvoices();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const sortedInvoices = useMemo(() => invoices, [invoices]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, refresh]);

  const handleSend = useCallback(
    async (invoiceId: string) => {
      setSendingId(invoiceId);
      try {
        await sendInvoice(invoiceId);
        await refresh();
      } catch (err) {
        console.error("Failed to send invoice:", err);
        Alert.alert("Send failed", "Please try again.");
      } finally {
        setSendingId(null);
      }
    },
    [refresh, sendInvoice]
  );

  const renderItem = ({ item }: { item: Invoice }) => {
    const total = item.totals?.total ?? 0;
    const statusLabel = item.status === "draft" ? "Draft" : "Sent";
    const actionLabel = item.status === "draft" ? "Send Email" : "Resend";
    const actionDisabled = sendingId === item.id;
    const badgeStyles =
      item.status === "draft"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";

    return (
      <View className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-slate-900">
              {item.buyer?.email || "Buyer"}
            </Text>
            <Text className="text-xs text-slate-500 mt-1">
              Created {formatDate(item.createdAt)}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${badgeStyles}`}>
            <Text className="text-xs font-semibold">{statusLabel}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs uppercase text-slate-400">Total</Text>
            <Text className="text-lg font-semibold text-slate-900">
              {formatCurrency(total, item.currency)}
            </Text>
          </View>
          <Pressable
            onPress={() => handleSend(item.id)}
            disabled={actionDisabled}
            className={`px-4 py-2 rounded-full border ${
              actionDisabled ? "border-slate-200" : "border-blue-500"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                actionDisabled ? "text-slate-400" : "text-blue-600"
              }`}
            >
              {actionLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <View
        className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100"
        style={{ paddingTop: insets.top }}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back-outline" size={22} color="#0F172A" />
        </Pressable>
        <Text className="text-base font-semibold text-slate-900">
          Invoices
        </Text>
        <Pressable
          onPress={() => navigation.navigate("CreateInvoice")}
          hitSlop={8}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
        </Pressable>
      </View>

      {error ? (
        <View className="px-4 py-3">
          <Text className="text-sm text-red-500">
            Failed to load invoices.
          </Text>
        </View>
      ) : null}

      {loading && invoices.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-slate-500">Loading invoices...</Text>
        </View>
      ) : invoices.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Text className="text-center text-base font-semibold text-slate-900">
              No invoices created
            </Text>
            <Text className="mt-2 text-center text-sm text-slate-500">
              Start by creating your first invoice to send to buyers.
            </Text>
            <Pressable
              onPress={() => navigation.navigate("CreateInvoice")}
              className="mt-5 h-[44px] rounded-full border border-blue-500 items-center justify-center"
            >
              <Text className="text-sm font-semibold text-blue-600">
                Create a new invoice
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={sortedInvoices}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom + 24, 40),
          }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

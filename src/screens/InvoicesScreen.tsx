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
import * as Clipboard from "expo-clipboard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { useInvoices } from "../domains/invoices/hooks/useInvoices";
import type { Invoice } from "../domains/invoices/types";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, "Invoices">;

const formatCurrency = (amount: number, currency: string) => {
  const prefix = currency === "USD" ? "$" : `${currency} `;
  return `${prefix}${amount.toFixed(2)}`;
};

const formatLongDate = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatInvoiceNumber = (id: string) => {
  const prefix = id.slice(0, 4).toUpperCase();
  const suffix = id.slice(-8).toUpperCase();
  return `IV-${prefix}-${suffix}`;
};

export default function InvoicesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { setHidden } = useTabBarVisibility();
  const { invoices, loading, error, refresh, sendInvoice } = useInvoices();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const sortedInvoices = useMemo(() => invoices, [invoices]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      setHidden(true);
      return () => setHidden(false);
    }, [refresh, setHidden])
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
    const actionLabel = item.status === "draft" ? "Send Invoice" : "Resend";
    const actionDisabled = sendingId === item.id;
    const primaryItem = item.items?.[0];
    const orderStatusLabel = "OPEN";
    const sentTo = item.buyer?.email || "-";
    const lastSent = formatLongDate(item.lastSentAt);
    const createdOn = formatLongDate(item.createdAt);
    const invoiceNumber = item.invoiceNumber || formatInvoiceNumber(item.id);

    return (
      <View className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm relative">
        <Pressable
          onPress={() =>
            navigation.navigate("InvoiceDetail", {
              invoiceId: item.id,
            })
          }
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                <Ionicons name="receipt-outline" size={22} color="#94A3B8" />
              </View>
              <View>
                <Text className="text-base font-semibold text-slate-900">
                  Invoice
                </Text>
              <Text className="text-sm font-semibold text-slate-900 mt-0.5">
                #{invoiceNumber}
              </Text>
              </View>
            </View>
            <Pressable
              onPress={() =>
                setActiveMenuId((prev) => (prev === item.id ? null : item.id))
              }
              hitSlop={8}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#94A3B8" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => handleSend(item.id)}
            disabled={actionDisabled}
            className={`mt-4 self-start rounded-full px-5 py-2 ${
              item.status === "draft"
                ? "bg-[#0B73FF]"
                : "border border-slate-200"
            }`}
          >
            <View className="flex-row items-center gap-2">
              {item.status === "draft" ? (
                <Ionicons name="mail-outline" size={14} color="#ffffff" />
              ) : null}
              <Text
                className={`text-sm font-semibold ${
                  item.status === "draft" ? "text-white" : "text-slate-700"
                }`}
              >
                {actionLabel}
              </Text>
            </View>
          </Pressable>

          <View className="mt-4 gap-3">
            <DetailRow label="Items" value={primaryItem?.title || "-"} />
            <DetailRow
              label="Total Order"
              value={formatCurrency(total, item.currency)}
              strong
            />
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-400">Order status</Text>
              <View className="rounded-full bg-slate-500 px-4 py-1">
                <Text className="text-xs font-semibold text-white">
                  {orderStatusLabel}
                </Text>
              </View>
            </View>
            <DetailRow label="Created On" value={createdOn} />
            <DetailRow label="Sent to" value={sentTo} />
            <DetailRow label="Last sent" value={lastSent} />
          </View>
        </Pressable>

        {activeMenuId === item.id ? (
          <View className="absolute right-6 top-[70px] z-20 w-[190px] rounded-2xl border border-slate-200 bg-white shadow-lg">
            <MenuItem
              icon="eye-outline"
              label="View"
              onPress={() => {
                setActiveMenuId(null);
                navigation.navigate("InvoiceDetail", {
                  invoiceId: item.id,
                });
              }}
              withDivider
            />
            <MenuItem
              icon="create-outline"
              label="Edit"
              onPress={() => {
                setActiveMenuId(null);
                navigation.navigate("PreviewInvoice", { invoiceId: item.id });
              }}
              withDivider
            />
            <MenuItem
              icon="link-outline"
              label="Copy link"
              onPress={async () => {
                await Clipboard.setStringAsync(item.id);
                setActiveMenuId(null);
                Alert.alert("Copied", "Invoice ID copied to clipboard.");
              }}
              withDivider
            />
            <MenuItem
              icon="trash-outline"
              label="Delete"
              destructive
              onPress={() => {
                setActiveMenuId(null);
                Alert.alert("Coming soon", "Delete is not available yet.");
              }}
            />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <InvoicesHeader
        topInset={insets.top}
        onPressBack={() => navigation.goBack()}
        onPressCreate={() => navigation.navigate("CreateInvoice")}
      />

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
            paddingHorizontal: 20,
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

function InvoicesHeader({
  topInset,
  onPressBack,
  onPressCreate,
}: {
  topInset: number;
  onPressBack: () => void;
  onPressCreate: () => void;
}) {
  return (
    <View className="bg-white border-b border-slate-100">
      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: topInset + 8, paddingBottom: 12 }}
      >
        <Pressable
          onPress={onPressBack}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </Pressable>

        <View className="items-center">
          <Text className="text-xl font-extrabold tracking-[1px] text-slate-900">
            INVOICES
          </Text>
          <View className="flex-row items-center mt-1" style={{ gap: 4 }}>
            <HeaderAccent />
            <HeaderAccent delay />
            <HeaderAccent />
          </View>
        </View>

        <Pressable
          onPress={onPressCreate}
          hitSlop={10}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#0B73FF" />
        </Pressable>
      </View>
    </View>
  );
}

function HeaderAccent({ delay }: { delay?: boolean }) {
  return (
    <View
      className="h-2 w-4 rounded-full"
      style={{
        backgroundColor: "#9BE163",
        transform: [{ rotate: delay ? "-10deg" : "10deg" }],
      }}
    />
  );
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-slate-400">{label}</Text>
      <Text className={strong ? "text-base font-semibold text-slate-900" : "text-sm text-slate-900"}>
        {value}
      </Text>
    </View>
  );
}

function MenuItem({
  icon,
  label,
  destructive = false,
  withDivider = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
  withDivider?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 px-4 py-3 ${
        withDivider ? "border-b border-slate-100" : ""
      }`}
    >
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? "#DC2626" : "#0F172A"}
      />
      <Text
        className={`text-sm font-semibold ${
          destructive ? "text-rose-600" : "text-slate-900"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

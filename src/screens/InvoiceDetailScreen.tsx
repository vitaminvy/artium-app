import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Invoice } from "../domains/invoices/types";
import { getInvoiceById } from "../domains/invoices/services/invoiceService";
import { useTabBarVisibility } from "../app/navigation/TabBarVisibilityContext";

const DELIVERY_OPTIONS = [
  "Pick up / Ship by seller",
  "Ship by Cohart",
  "Invoice Only",
];

const formatCurrency = (amount: number, currency: string) => {
  const prefix = currency === "USD" ? "US$ " : `${currency} `;
  return `${prefix}${amount.toFixed(2)}`;
};

const formatInvoiceNumber = (id: string) => {
  if (!id) return "Invoice";
  const prefix = id.slice(0, 4).toUpperCase();
  const suffix = id.slice(-8).toUpperCase();
  return `IV-${prefix}-${suffix}`;
};

export default function InvoiceDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [delivery, setDelivery] = useState(DELIVERY_OPTIONS[0]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const { setHidden } = useTabBarVisibility();

  const invoiceId = (route.params as any)?.invoiceId as string | undefined;

  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) {
        setLoading(false);
        return;
      }
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

  useFocusEffect(
    React.useCallback(() => {
      setHidden(true);
      return () => setHidden(false);
    }, [setHidden])
  );

  const invoiceNumber = useMemo(() => {
    if (!invoice?.id) return "";
    return invoice.invoiceNumber || formatInvoiceNumber(invoice.id);
  }, [invoice?.id, invoice?.invoiceNumber]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!invoice) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyText}>Invoice not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/auth-decor.jpg")}
        style={styles.background}
      >
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={8}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </Pressable>
          </View>

          <Text style={styles.title}>Invoice{"\n"}#{invoiceNumber}</Text>

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed-outline" size={16} color="#94A3B8" />
            <Text style={styles.secureText}>SECURE CHECKOUT</Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.primaryPill}>
              <Ionicons name="mail-outline" size={16} color="#0F172A" />
              <Text style={styles.primaryPillText}>Send Invoice</Text>
            </Pressable>

            <View style={styles.iconRow}>
              <IconButton icon="create-outline" onPress={() => {}} />
              <IconButton icon="qr-code-outline" onPress={() => {}} />
              <IconButton icon="link-outline" onPress={() => {}} />
              <IconButton icon="trash-outline" onPress={() => {}} />
            </View>
          </View>

          <InvoiceCardSection title="FROM">
            <Text style={styles.cardTitle}>
              {invoice.sellerSnapshot?.displayName || "Seller"}
            </Text>
            {invoice.sellerSnapshot?.uid ? (
              <Text style={styles.cardSubtitle}>{invoice.sellerSnapshot.uid}</Text>
            ) : null}
          </InvoiceCardSection>

          <InvoiceCardSection title="TO">
            <Text style={styles.cardTitle}>
              {invoice.buyer?.name || "Buyer"}
            </Text>
            <Text style={styles.cardSubtitle}>{invoice.buyer?.email}</Text>
          </InvoiceCardSection>

          <InvoiceCardSection title="ITEMS">
            {invoice.items.map((item, index) => (
              <View key={`${item.title}-${index}`} style={styles.itemRow}>
                <Text style={styles.itemIndex}>#{index + 1}</Text>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.title}</Text>
                  <Text style={styles.itemQty}>
                    Qty {item.quantity} ·{" "}
                    {formatCurrency(item.unitPrice, invoice.currency)}
                  </Text>
                </View>
              </View>
            ))}
          </InvoiceCardSection>

          <InvoiceCardSection title="DELIVERY METHOD">
            {/* TODO: Wire delivery method when invoice schema supports it. */}
            <SegmentedControl
              options={DELIVERY_OPTIONS}
              selected={delivery}
              onChange={setDelivery}
            />
          </InvoiceCardSection>

          <InvoiceCardSection title="ORDER SUMMARY">
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(invoice.totals.subtotal, invoice.currency)}
              </Text>
            </View>
            {typeof invoice.totals.discount === "number" ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(invoice.totals.discount, invoice.currency)}
                </Text>
              </View>
            ) : null}
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {formatCurrency(invoice.totals.total, invoice.currency)}
              </Text>
            </View>
          </InvoiceCardSection>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

function InvoiceCardSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>{title}</Text>
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}

function IconButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.iconButton} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#0F172A" />
    </Pressable>
  );
}

function SegmentedControl({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.segmentContainer}>
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.segment,
              isActive ? styles.segmentActive : styles.segmentInactive,
            ]}
          >
            <Text style={isActive ? styles.segmentTextActive : styles.segmentText}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(248, 250, 252, 0.82)",
  },
  loading: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 18,
  },
  header: {
    height: 44,
    justifyContent: "center",
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 38,
  },
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  secureText: {
    fontSize: 12,
    letterSpacing: 0.8,
    color: "#94A3B8",
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  primaryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  primaryPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  iconRow: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#94A3B8",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  itemIndex: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94A3B8",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  itemQty: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 6,
  },
  segmentContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  segmentActive: {
    borderColor: "#0B73FF",
    backgroundColor: "#EFF6FF",
  },
  segmentInactive: {
    borderColor: "rgba(148, 163, 184, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  segmentText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  segmentTextActive: {
    fontSize: 12,
    color: "#0B73FF",
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  summaryValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  summaryTotal: {
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  summaryTotalValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
});

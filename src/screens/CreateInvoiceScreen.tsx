import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { HomeStackParamList } from "../app/navigation/Stack/HomeStack";
import { useInvoices } from "../domains/invoices/hooks/useInvoices";
import { useAuth } from "../domains/auth/contexts/AuthContext";
import { useInventoryList } from "../domains/inventory/hooks/useInventoryList";
import { LabeledField } from "../domains/inventory/components/ui/LabeledField";
import { SectionCard } from "../domains/inventory/components/ui/SectionCard";
import InvoiceArtworkSelectCard from "../domains/invoices/components/InvoiceArtworkSelectCard";
import EventHeader from "../domains/events/components/ui/EventHeader";
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
  "CreateInvoice"
>;

type FieldKey = "buyerEmail" | "artwork";

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

const parsePrice = (value?: string) => {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function CreateInvoiceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const items = useSidebarItems();
  const { setHidden } = useTabBarVisibility();
  const { currentUser } = useAuth();
  const { createDraft } = useInvoices();
  const { artworks, loading: inventoryLoading } = useInventoryList();
  const {
    logout,
    loading: logoutLoading,
    showConfirmModal,
    onConfirmLogout,
    onCancelLogout,
  } = useLogout();
  const scrollRef = useRef<ScrollView>(null);
  const fieldPositions = useRef<Record<FieldKey, number>>({} as any);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<SidebarKey>("invoices");
  const [headerHeight, setHeaderHeight] = useState(96);

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
  const [showArtworkModal, setShowArtworkModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [scrollToError, setScrollToError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectableArtworks = useMemo(
    () => artworks.filter((item) => item.status !== "Sold"),
    [artworks]
  );

  const filteredArtworks = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return selectableArtworks;
    return selectableArtworks.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const artist = item.artist?.toLowerCase() ?? "";
      return title.includes(term) || artist.includes(term);
    });
  }, [searchQuery, selectableArtworks]);

  const selectedArtworks = useMemo(
    () => artworks.filter((item) => selectedArtworkIds.includes(item.id)),
    [artworks, selectedArtworkIds]
  );

  const quantityValue = selectedArtworks.length;

  const subtotal = useMemo(() => {
    return selectedArtworks.reduce((sum, item) => {
      const unitPrice = parsePrice(item.details?.price || item.price);
      return sum + unitPrice;
    }, 0);
  }, [selectedArtworks]);

  useFocusEffect(
    useCallback(() => {
      setHidden(true);
      setActiveKey("invoices");
      return () => setHidden(false);
    }, [setHidden, setActiveKey])
  );

  useEffect(() => {
    if (!scrollToError || !errors || !scrollRef.current) return;
    const firstKey = Object.keys(errors)[0] as FieldKey | undefined;
    if (firstKey) {
      const y = fieldPositions.current[firstKey];
      if (typeof y === "number") {
        scrollRef.current.scrollTo({ y: Math.max(y - 20, 0), animated: true });
      }
    }
    setScrollToError(false);
  }, [errors, scrollToError]);

  const clearFieldError = useCallback((key: FieldKey) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

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

  const handleCancel = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate("Invoices");
  }, [navigation]);

  const validateForm = useCallback(() => {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const email = buyerEmail.trim();
    if (!email) {
      nextErrors.buyerEmail = "Email is required.";
    } else if (!isValidEmail(email)) {
      nextErrors.buyerEmail = "Enter a valid email address.";
    }

    if (selectedArtworks.length === 0) {
      nextErrors.artwork = "Select at least one artwork from your inventory.";
    } else if (
      selectedArtworks.some(
        (item) => parsePrice(item.details?.price || item.price) <= 0
      )
    ) {
      nextErrors.artwork = "Selected artworks must include a price.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setScrollToError(true);
      return false;
    }
    return true;
  }, [buyerEmail, selectedArtworks]);

  const handleContinue = useCallback(async () => {
    if (!currentUser) {
      Alert.alert("Missing user", "Please sign in again.");
      return;
    }
    if (!validateForm()) return;
    if (selectedArtworks.length === 0) return;

    setSubmitting(true);
    try {
      const sellerSnapshot = {
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email || "Seller",
        photoURL: currentUser.photoURL || undefined,
      };
      const invoiceId = await createDraft({
        sellerId: currentUser.uid,
        sellerSnapshot,
        buyer: {
          name: buyerName.trim() || undefined,
          email: buyerEmail.trim(),
          message: message.trim() || undefined,
        },
        items: selectedArtworks.map((item) => ({
          type: "artwork" as const,
          title: item.title,
          quantity: 1,
          unitPrice: parsePrice(item.details?.price || item.price),
          artworkId: item.id,
          image: item.thumbnail || undefined,
        })),
        currency: "USD",
        totals: {
          subtotal,
          total: subtotal,
        },
      });

      navigation.navigate("PreviewInvoice", { invoiceId });
    } catch (err) {
      console.error("Failed to create invoice:", err);
      Alert.alert("Create failed", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    buyerEmail,
    buyerName,
    createDraft,
    currentUser,
    message,
    navigation,
    selectedArtworks,
    subtotal,
    validateForm,
  ]);

  const toggleArtwork = useCallback(
    (id: string) => {
      setSelectedArtworkIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      clearFieldError("artwork");
    },
    [clearFieldError]
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <EventHeader
        title="CREATE INVOICE"
        onPressBack={handleCancel}
        onPressSidebar={() => setSidebarOpen((prev) => !prev)}
        isSidebarOpen={sidebarOpen}
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            padding: 20,
            paddingBottom: Math.max(insets.bottom + 140, 200),
            gap: 20,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View onLayout={(e) => (fieldPositions.current.buyerEmail = e.nativeEvent.layout.y)}>
            <SectionCard
              title="Buyer information"
              subtitle="Update these details anytime before sending."
            >
              <LabeledField
                label="Full name"
                value={buyerName}
                placeholder="Enter buyer name"
                autoCapitalize="words"
                onChangeText={setBuyerName}
              />
              <View>
              <LabeledField
                label="Email"
                value={buyerEmail}
                placeholder="buyer@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                onChangeText={(value) => {
                  setBuyerEmail(value);
                  clearFieldError("buyerEmail");
                }}
              />
                {errors.buyerEmail ? (
                  <Text className="mt-1 text-[12px] text-rose-600">
                    {errors.buyerEmail}
                  </Text>
                ) : null}
              </View>
              <LabeledField
                label="Message to buyer"
                value={message}
                placeholder="Enter your message (optional)"
                multiline
                helper="This message will be included in the email."
                onChangeText={setMessage}
              />
            </SectionCard>
          </View>

          <View onLayout={(e) => (fieldPositions.current.artwork = e.nativeEvent.layout.y)}>
            <SectionCard
              title="Items"
              subtitle="Add items from your inventory for invoicing."
            >
              <Pressable
                onPress={() => setShowArtworkModal(true)}
                className="mt-1 rounded-full border border-[#0B73FF] px-5 py-3 items-center"
              >
                <Text className="text-sm font-semibold text-[#0B73FF]">
                  Add item from inventory
                </Text>
              </Pressable>

              {selectedArtworks.length > 0 ? (
                <View className="gap-3 mt-4">
                  <Text className="text-xs font-semibold text-slate-500 uppercase">
                    Selected items
                  </Text>
                  {selectedArtworks.map((item) => (
                    <View
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex-row items-center justify-between"
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </Text>
                        <Text className="text-xs text-slate-500 mt-0.5">
                          {item.artist} • {item.year}
                        </Text>
                      </View>
                      <Text className="text-sm font-semibold text-slate-900">
                        {item.price}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {errors.artwork ? (
                <Text className="text-[12px] text-rose-600">
                  {errors.artwork}
                </Text>
              ) : null}

              <LabeledField
                label="Quantity"
                value={`${quantityValue}`}
                editable={false}
                onChangeText={() => {}}
              />
              <Text className="text-[11px] text-slate-400">
                Quantity is calculated from your selected items.
              </Text>
            </SectionCard>
          </View>

          <SectionCard title="Summary">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-slate-600">Subtotal</Text>
              <Text className="text-base font-semibold text-slate-900">
                ${subtotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold text-slate-900">
                Total
              </Text>
              <Text className="text-lg font-semibold text-slate-900">
                ${subtotal.toFixed(2)}
              </Text>
            </View>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        className="border-t border-slate-200 bg-white px-6 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={handleCancel}
            className="flex-1 rounded-full border border-slate-200 py-3 items-center active:opacity-80"
          >
            <Text className="text-sm font-semibold text-slate-600">
              Cancel
            </Text>
          </Pressable>
          <Pressable
            onPress={handleContinue}
            disabled={submitting}
            className={`flex-1 rounded-full py-3 items-center ${
              submitting ? "bg-slate-200" : "bg-[#0B73FF]"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                submitting ? "text-slate-500" : "text-white"
              }`}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showArtworkModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowArtworkModal(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full max-h-[80%] rounded-[28px] bg-white p-6">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-slate-900">
                Select Artwork
              </Text>
              <Pressable
                onPress={() => setShowArtworkModal(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </Pressable>
            </View>
            <Text className="text-sm text-slate-500 mt-2">
              Choose artworks from your inventory. Only available items can be selected.
            </Text>

            <View className="mt-4 flex-row items-center rounded-full border border-slate-200 px-4 py-3">
              <Ionicons name="search" size={18} color="#94A3B8" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search"
                placeholderTextColor="#94A3B8"
                className="ml-2 flex-1 text-sm text-slate-900"
              />
            </View>

            <ScrollView
              className="mt-4"
              contentContainerStyle={{ paddingBottom: 12 }}
              keyboardShouldPersistTaps="handled"
            >
              {inventoryLoading ? (
                <Text className="text-sm text-slate-500">
                  Loading inventory...
                </Text>
              ) : filteredArtworks.length === 0 ? (
                <View className="items-center py-12">
                  <Text className="text-sm text-slate-500">
                    No artworks found
                  </Text>
                  <Pressable
                    onPress={() => {
                      setShowArtworkModal(false);
                      navigation.navigate("Upload");
                    }}
                    className="mt-3"
                  >
                    <Text className="text-sm font-semibold text-[#0B73FF]">
                      Upload a new artwork
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="gap-3">
                  {filteredArtworks.map((item) => (
                    <InvoiceArtworkSelectCard
                      key={item.id}
                      item={item}
                      selected={selectedArtworkIds.includes(item.id)}
                      onPress={() => toggleArtwork(item.id)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>

            <View className="mt-4 flex-row items-center gap-3">
              <Pressable
                onPress={() => setShowArtworkModal(false)}
                className="flex-1 rounded-full border border-slate-200 py-3 items-center"
              >
                <Text className="text-sm font-semibold text-slate-700">
                  Back
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowArtworkModal(false)}
                className="flex-1 rounded-full bg-[#0B73FF] py-3 items-center"
              >
                <Text className="text-sm font-semibold text-white">Done</Text>
              </Pressable>
            </View>
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

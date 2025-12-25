import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  visible: boolean;
  onStartExploring: () => void;
  onEditProfile: () => void;
};

export default function ProfileOnboardingModal({
  visible,
  onStartExploring,
  onEditProfile,
}: Props) {
  const cardShadow: ViewStyle = {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStartExploring}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.title}>Welcome to Artium!</Text>
          <Text style={styles.body}>
            Upload and manage your inventory, create invoices, share your
            storefront, and more.
          </Text>
          <Text style={styles.body}>
            To personalize your experience on Artium, we recommend you complete
            your profile first.
          </Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onStartExploring}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.secondaryButtonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Start Exploring</Text>
            </Pressable>
            <Pressable
              onPress={onEditProfile}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 22,
    maxWidth: 360,
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#475569",
    textAlign: "center",
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
  },
  secondaryButtonPressed: {
    backgroundColor: "#F8FAFC",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
  },
  primaryButtonPressed: {
    backgroundColor: "#1D4ED8",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

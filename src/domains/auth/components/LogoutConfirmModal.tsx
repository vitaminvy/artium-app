import React from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type LogoutConfirmModalProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function LogoutConfirmModal({
  visible,
  onConfirm,
  onCancel,
  loading = false,
}: LogoutConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-6">
        <View className="w-full rounded-[28px] bg-white p-6">
          <View className="flex-row justify-end">
            <Pressable
              onPress={onCancel}
              hitSlop={12}
              className="h-10 w-10 items-center justify-center rounded-full"
              disabled={loading}
            >
              <Ionicons name="close" size={22} color="#0F172A" />
            </Pressable>
          </View>

          <View className="mt-2 mb-5">
            <Text className="text-2xl font-bold text-slate-900 text-center">
              Are you sure{"\n"}you want to log out?
            </Text>
            <Text className="mt-3 text-base text-slate-500 text-center">
              You will need to sign in again to access your account.
            </Text>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className={`rounded-full border border-rose-500 py-3 items-center ${
                loading ? "opacity-50" : "active:opacity-80"
              }`}
            >
              <Text className="text-base font-semibold text-rose-500">
                {loading ? "Logging out..." : "Log out"}
              </Text>
            </Pressable>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className={`rounded-full border border-slate-200 py-3 items-center ${
                loading ? "opacity-50" : "active:opacity-80"
              }`}
            >
              <Text className="text-base font-semibold text-slate-700">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

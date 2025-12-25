import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as MailComposer from "expo-mail-composer";
import type { EventItem } from "../../../discover/types";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Loader from "../../../../shared/components/Loader";

type Props = {
  visible: boolean;
  onClose: () => void;
  event: EventItem;
  organizerName?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pillBg = "#0B73FF";
const pillText = "#FFFFFF";

export default function EventEmailModal({ visible, onClose, event, organizerName }: Props) {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const insets = useSafeAreaInsets();

  const dateLabel = useMemo(() => {
    const date = new Date(event.datetime ?? event.startDate ?? 0);
    return date.toLocaleString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [event.datetime, event.startDate]);

  const canAdd = useMemo(() => emailRegex.test(input.trim()), [input]);
  const canSend = recipients.length > 0 && !isSending;

  const addRecipient = () => {
    const email = input.trim();
    if (!emailRegex.test(email)) return;
    setRecipients((prev) => (prev.includes(email) ? prev : [...prev, email]));
    setInput("");
  };

  const removeRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((item) => item !== email));
  };

  const buildBody = () => {
    return [
      "Xin chào,",
      "",
      `Bạn được mời tham dự sự kiện "${event.title}".`,
      `Thời gian: ${dateLabel}`,
      event.location ? `Địa điểm: ${event.location}` : null,
      event.eventType ? `Loại sự kiện: ${event.eventType}` : null,
      organizerName ? `Người tổ chức: ${organizerName}` : null,
      event.attendees ? `Số người đã đăng ký/quan tâm: ${event.attendees}` : null,
      "",
      note || "Rất mong bạn tham gia!",
      "",
      "Gửi từ Artium.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleSend = async () => {
    if (!canSend) return;
    setIsSending(true);
    try {
      const available = await MailComposer.isAvailableAsync();
      if (!available) {
        Alert.alert("Không thể mở ứng dụng Mail", "Vui lòng kiểm tra cài đặt Mail trên thiết bị.");
        setIsSending(false);
        return;
      }
      await MailComposer.composeAsync({
        recipients,
        subject: `[Artium] ${event.title}`,
        body: buildBody(),
        isHtml: false,
      });

      // Đóng modal ngay sau khi mở mail app
      onClose();

      // Chỉ reset state sau khi đóng modal
      setIsSending(false);
    } catch (error) {
      console.error("Send mail failed", error);
      Alert.alert("Không thể mở Mail", "Vui lòng thử lại hoặc kiểm tra cài đặt ứng dụng Mail.");
      setIsSending(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/35">
        <KeyboardAvoidingView
          className="mt-auto rounded-t-3xl bg-white"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 32 : 0}
          style={{ maxHeight: "92%", paddingBottom: insets.bottom || 12 }}
        >
          {isSending && (
            <View
              className="absolute inset-0 bg-white/80 z-50 rounded-t-3xl"
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Loader color="#0F172A" backgroundColor="transparent" />
            </View>
          )}
          <View
            className="flex-row items-center justify-between px-4 py-3 border-b border-slate-200"
            style={{ paddingTop: Math.max(insets.top / 2, 8) }}
          >
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full active:opacity-80"
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color="#0F172A" />
            </Pressable>
            <Text className="text-[16px] font-semibold text-slate-900">Gửi mail mời</Text>
            <View className="h-10 w-10" />
          </View>

          <KeyboardAwareScrollView
            className="px-4 pt-3"
            keyboardShouldPersistTaps="handled"
            extraScrollHeight={40}
            enableOnAndroid
            enableAutomaticScroll
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom + 80, 120),
              rowGap: 16,
            }}
          >
            <View className="gap-2">
              <Text className="text-[12px] font-semibold text-slate-600">Người nhận</Text>
              <View className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <View className="flex-row flex-wrap gap-2">
                  {recipients.map((email) => (
                    <View
                      key={email}
                      className="flex-row items-center rounded-full px-2 py-1"
                      style={{ backgroundColor: pillBg }}
                    >
                      <Text className="text-[12px] font-semibold" style={{ color: pillText }}>
                        {email}
                      </Text>
                      <Pressable
                        className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-white/20 active:opacity-80"
                        onPress={() => removeRecipient(email)}
                      >
                        <Ionicons name="close" size={12} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  ))}
                </View>
                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Nhập email và nhấn Thêm"
                    placeholderTextColor="#94A3B8"
                    className="text-slate-900"
                    style={{
                      flex: 1,
                      fontSize: 14,
                      paddingVertical: 12,
                      paddingHorizontal: 0,
                      minHeight: 44,
                      textAlignVertical: "center",
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    className={`px-3 py-2 rounded-full ${canAdd ? "bg-slate-900" : "bg-slate-200"}`}
                    disabled={!canAdd}
                    onPress={addRecipient}
                  >
                    <Text
                      className="text-[12px] font-semibold"
                      style={{ color: canAdd ? "#FFFFFF" : "#94A3B8" }}
                    >
                      Thêm
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-[12px] font-semibold text-slate-600">Ghi chú thêm</Text>
              <View className="rounded-2xl border border-slate-200 bg-white px-3">
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Lời nhắn gửi kèm (tuỳ chọn)"
                  placeholderTextColor="#94A3B8"
                  className="text-slate-900"
                  style={{
                    fontSize: 14,
                    paddingVertical: 8,
                    paddingHorizontal: 0,
                    minHeight: 60,
                    textAlignVertical: "center",
                  }}
                  multiline
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-[12px] font-semibold text-slate-600">Xem trước nội dung</Text>
              <View className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <Text className="text-[13px] text-slate-800">
                  {buildBody()}
                </Text>
              </View>
            </View>
          </KeyboardAwareScrollView>

          <View className="px-4 pb-4">
            <Pressable
              className={`h-12 rounded-full items-center justify-center ${
                canSend ? "bg-slate-900" : "bg-slate-200"
              }`}
              disabled={!canSend}
              onPress={handleSend}
            >
              <Text
                className="text-[14px] font-semibold"
                style={{ color: canSend ? "#FFFFFF" : "#94A3B8" }}
              >
                {isSending ? "Đang chuẩn bị..." : "Mở mail để gửi"}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

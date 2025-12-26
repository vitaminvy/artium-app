import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  startAt,
  writeBatch,
  endAt,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";
import type { EventItem } from "../../../discover/types";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Loader from "../../../../shared/components/Loader";
import MultiSelectSheet from "../ui/MultiSelectSheet";
import { firestore } from "@/configs/firebase";

type Props = {
  visible: boolean;
  onClose: () => void;
  event: EventItem;
  organizerName?: string;
};

const pillBg = "#0B73FF";
const pillText = "#FFFFFF";

type UserOption = {
  id: string;
  uid: string;
  label: string;
  email: string;
};

const USERS_PAGE_SIZE = 10;

export default function EventEmailModal({ visible, onClose, event, organizerName }: Props) {
  const [recipients, setRecipients] = useState<UserOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [loadUsersError, setLoadUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const insets = useSafeAreaInsets();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchIdRef = useRef(0);
  const lastUserDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

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

  const canSend = recipients.length > 0 && !isSending;

  const markInvitedRecipients = useCallback(
    async (targetRecipients: UserOption[]) => {
      const validRecipients = targetRecipients.filter((recipient) => recipient.uid);
      if (!validRecipients.length) return;

      const chunkSize = 400;
      for (let i = 0; i < validRecipients.length; i += chunkSize) {
        const batch = writeBatch(firestore);
        const chunk = validRecipients.slice(i, i + chunkSize);
        chunk.forEach((recipient) => {
          const rsvpRef = doc(
            firestore,
            "users",
            recipient.uid,
            "event_rsvps",
            event.id
          );
          batch.set(
            rsvpRef,
            {
              eventId: event.id,
              status: "invited",
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        });
        await batch.commit();
      }
    },
    [event.id]
  );

  const fetchUsers = useCallback(
    async ({ reset }: { reset: boolean }) => {
      const fetchId = fetchIdRef.current + 1;
      fetchIdRef.current = fetchId;
      setIsLoadingUsers(true);
      setLoadUsersError(null);
      if (reset) {
        setUserOptions([]);
        lastUserDocRef.current = null;
        setHasMoreUsers(true);
      }

      try {
        const keyword = searchQuery.trim();
        const baseQuery = keyword
          ? query(
              collection(firestore, "users"),
              orderBy("displayName"),
              startAt(keyword),
              endAt(`${keyword}\uf8ff`)
            )
          : query(collection(firestore, "users"), orderBy("displayName"));
        const pagedQuery =
          !reset && lastUserDocRef.current
            ? query(baseQuery, startAfter(lastUserDocRef.current), limit(USERS_PAGE_SIZE))
            : query(baseQuery, limit(USERS_PAGE_SIZE));

        const snapshot = await getDocs(pagedQuery);
        const nextOptions = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const email = String(data.email || "").trim();
            if (!email) return null;
            const name = String(data.displayName || "").trim();
            return {
              id: doc.id,
              uid: doc.id,
              label: name || email,
              email,
            } as UserOption;
          })
          .filter(Boolean) as UserOption[];

        if (fetchId !== fetchIdRef.current) return;

        setUserOptions((prev) => {
          const base = reset ? [] : prev;
          const seen = new Set(base.map((item) => item.uid));
          const merged = [...base];
          nextOptions.forEach((option) => {
            if (!seen.has(option.uid)) {
              merged.push(option);
              seen.add(option.uid);
            }
          });
          return merged;
        });

        lastUserDocRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
        setHasMoreUsers(snapshot.size === USERS_PAGE_SIZE);
      } catch (error) {
        console.error("Error loading users for email invite:", error);
        if (fetchId === fetchIdRef.current) {
          setLoadUsersError("Không thể tải danh sách người dùng.");
        }
      } finally {
        if (fetchId === fetchIdRef.current) {
          setIsLoadingUsers(false);
        }
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    if (!visible) {
      fetchIdRef.current += 1;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      setSearchQuery("");
      setUserOptions([]);
      lastUserDocRef.current = null;
      setHasMoreUsers(true);
      setLoadUsersError(null);
      setIsLoadingUsers(false);
      return;
    }

    const delay = searchQuery.trim() ? 300 : 0;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers({ reset: true });
    }, delay);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [visible, searchQuery, fetchUsers]);

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
      const result = await MailComposer.composeAsync({
        recipients: recipients.map((recipient) => recipient.email),
        subject: `[Artium] ${event.title}`,
        body: buildBody(),
        isHtml: false,
      });
      if (result.status !== MailComposer.MailComposerStatus.CANCELLED) {
        await markInvitedRecipients(recipients);
      }

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
              <View className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <MultiSelectSheet
                  value={recipients}
                  options={userOptions}
                  onChange={setRecipients}
                  placeholder="Chọn người nhận"
                  searchable
                  searchPlaceholder="Tìm theo tên"
                  onSearch={setSearchQuery}
                  searchMode="remote"
                  onEndReached={() => {
                    if (isLoadingUsers || !hasMoreUsers) return;
                    fetchUsers({ reset: false });
                  }}
                  isLoading={isLoadingUsers}
                  emptyLabel="Không có người dùng phù hợp."
                  loadingLabel="Đang tải danh sách..."
                  displayMode="badges"
                  badgeColor={pillBg}
                  badgeTextColor={pillText}
                  maxBadges={3}
                />
                {loadUsersError ? (
                  <Text className="mt-2 text-[11px] text-red-500">{loadUsersError}</Text>
                ) : null}
                {!isLoadingUsers &&
                !loadUsersError &&
                userOptions.length === 0 &&
                !searchQuery.trim() ? (
                  <Text className="mt-2 text-[11px] text-slate-400">
                    Chưa có người dùng nào để chọn.
                  </Text>
                ) : null}
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

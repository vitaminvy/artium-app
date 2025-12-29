import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";

import { useAuth } from "../domains/auth/contexts/AuthContext";
import { firestore } from "@/configs/firebase";
import { markAllNotificationsAsRead } from "../domains/notifications/services/notificationService";

type NotificationItem = {
  id: string;
  type: "like" | "comment" | "reshare" | string;
  actorName: string;
  message: string;
  createdAt: number;
  read?: boolean;
};

const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
};

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  like: "heart-outline",
  comment: "chatbubble-ellipses-outline",
  reshare: "repeat-outline",
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!currentUser) {
      console.log("NotificationsScreen: No currentUser");
      return;
    }
    console.log("NotificationsScreen: Listening to notifications for user:", currentUser.uid);
    const ref = collection(firestore, "users", currentUser.uid, "notifications");
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        console.log("NotificationsScreen: Received snapshot with", snap.docs.length, "documents");
        snap.docs.forEach((doc, idx) => {
          console.log(`  [${idx}] ${doc.id}:`, doc.data());
        });
        const list: NotificationItem[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          const createdAt =
            (data.createdAt as Timestamp | undefined)?.toMillis?.() ||
            Date.now();
          return {
            id: doc.id,
            type: data.type || "comment",
            actorName: data.actorName || "Someone",
            message: data.message || "",
            createdAt,
            read: data.read,
          };
        });
        setItems(list);
      },
      (err) => console.warn("notifications snapshot error", err)
    );
    return () => unsub();
  }, [currentUser]);

  // Mark all notifications as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (!currentUser) return;

      // Wait a bit for user to see the notifications before marking as read
      const timer = setTimeout(() => {
        markAllNotificationsAsRead(currentUser.uid).catch((error) => {
          console.error("Failed to mark notifications as read:", error);
        });
      }, 1000); // 1 second delay

      return () => clearTimeout(timer);
    }, [currentUser])
  );

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
          Notifications
        </Text>
      </View>

      {!currentUser ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-slate-500 text-center">
            Please sign in to view notifications.
          </Text>
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-base text-slate-500 text-center">
            No notifications yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom + 40, 80),
          }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-3 py-3">
              <Ionicons
                name={typeIcon[item.type] ?? "notifications-outline"}
                size={20}
                color="#0F172A"
              />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-slate-900">
                  {item.actorName}
                </Text>
                <Text className="text-sm text-slate-600" numberOfLines={2}>
                  {item.message}
                </Text>
              </View>
              <Text className="text-[12px] text-slate-400">
                {formatTime(item.createdAt)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, Pressable, Modal, GestureResponderEvent, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { EventItem } from "../../types";
import { openShareLink } from "../../../../shared/utils/share";
import EventEmailModal from "../../../events/components/modals/EventEmailModal";

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.05,
  shadowRadius: 10,
  elevation: 4,
};

type Props = {
  item: EventItem;
  onPress?: () => void;
  onDelete?: (eventId: string) => void;
  onInviteSent?: (eventId: string, invitedCount: number) => void;
};

export default function HostingEventCard({
  item,
  onPress,
  onDelete,
  onInviteSent,
}: Props) {
  const date = useMemo(
    () => new Date(item.datetime ?? item.startDate ?? 0),
    [item.datetime, item.startDate]
  );
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const timeLabel =
    item.timeLabel ??
    date.toLocaleString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  const attendeeLabel = item.attendees
    ? `${item.attendees} attendee${item.attendees === 1 ? "" : "s"}`
    : undefined;
  const hasImage = typeof item.image === "string" && item.image.trim().length > 0;
  const [imageLoaded, setImageLoaded] = useState(!hasImage);

  useEffect(() => {
    setImageLoaded(!hasImage);
  }, [hasImage, item.image]);

  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const stopPropagation =
    (fn?: (event?: GestureResponderEvent) => void) => (event: GestureResponderEvent) => {
      event?.stopPropagation?.();
      fn?.(event);
    };

  const handleDelete = () => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await onDelete?.(item.id);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const Container = onPress ? Pressable : View;

  return (
    <Container
      className="rounded-3xl bg-white border border-slate-200 overflow-hidden relative"
      style={cardShadow}
      onPress={onPress}
    >
      <View style={{ opacity: imageLoaded ? 1 : 0 }}>
        <View className="relative">
          {hasImage ? (
            <Image
              source={{ uri: item.image }}
              className="h-48 w-full"
              resizeMode="cover"
              onLoadEnd={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          ) : (
            <View className="h-48 w-full bg-slate-200" />
          )}
          <View className="absolute top-3 right-3 bg-white rounded-2xl px-2 py-2 items-center shadow-sm">
            <View className="rounded-full bg-[#0B73FF] px-2 py-0.5">
              <Text className="text-[11px] font-semibold text-white">
                {month}
              </Text>
            </View>
            <Text className="mt-1 text-xl font-extrabold text-[#0B1223] leading-6">
              {day}
            </Text>
          </View>
        </View>

        <View className="px-4 py-4 gap-2">
          <Text className="text-[12px] text-slate-500">
            {item.location} - {timeLabel}
          </Text>

          <Text className="text-lg font-semibold text-slate-900">
            {item.title}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            {item.category ? (
              <Text className="text-[12px] text-slate-500">
                {item.category}
              </Text>
            ) : null}
            {attendeeLabel ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="globe-outline" size={12} color="#94A3B8" />
                <Text className="text-[12px] text-slate-500">
                  {attendeeLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row items-center gap-2 mt-3">
            <Pressable
              className="flex-1 flex-row items-center justify-center gap-2 px-4 py-3 rounded-full border border-[#E2E8F0] bg-white active:opacity-90"
              onPress={stopPropagation(() => setShowEmail(true))}
            >
              <Ionicons name="mail-outline" size={16} color="#0F172A" />
              <Text className="text-xs font-semibold text-slate-900">
                Invite
              </Text>
            </Pressable>
            <Pressable
              className="h-11 w-11 rounded-full border border-slate-200 items-center justify-center active:opacity-90"
              onPress={stopPropagation(() => setShowShare(true))}
            >
              <Ionicons name="share-outline" size={18} color="#0F172A" />
            </Pressable>
            <Pressable
              className="h-11 w-11 rounded-full border border-slate-200 items-center justify-center active:opacity-90"
              onPress={stopPropagation(handleDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              )}
            </Pressable>
          </View>

          {showShare ? (
            <Modal
              transparent
              animationType="fade"
              onRequestClose={() => setShowShare(false)}
            >
              <View className="flex-1 bg-black/35 justify-center items-center px-4">
                <Pressable
                  className="absolute inset-0"
                  onPress={() => setShowShare(false)}
                />
                <View className="w-full rounded-3xl bg-white p-4 gap-4 shadow-2xl">
                  <View className="flex-row justify-between">
                    {[
                      { icon: "logo-whatsapp" as const, color: "#25D366", key: "whatsapp" },
                      { icon: "logo-facebook" as const, color: "#1877F2", key: "facebook" },
                      { icon: "logo-twitter" as const, color: "#000000", key: "twitter" },
                      { icon: "logo-linkedin" as const, color: "#0A66C2", key: "linkedin" },
                      { icon: "paper-plane-outline" as const, color: "#0EA5E9", key: "telegram" },
                    ].map((opt, idx) => (
                      <Pressable
                        key={idx}
                        className="h-14 w-14 rounded-full bg-slate-100 items-center justify-center active:opacity-80"
                        onPress={() =>
                          openShareLink(
                            opt.key as any,
                            `https://www.artium.com/event/${item.id ?? "link"}`,
                            item.title
                          )
                        }
                      >
                        <Ionicons name={opt.icon} size={22} color={opt.color} />
                      </Pressable>
                    ))}
                  </View>
                  <View className="flex-row items-center rounded-2xl border border-slate-200 px-3 py-3">
                    <Text className="flex-1 text-sm text-slate-800">
                      https://www.artium.com/event/{item.id ?? "link"}
                    </Text>
                    <Pressable
                      onPress={async () => {
                        const url = `https://www.artium.com/event/${item.id ?? "link"}`;
                        await Clipboard.setStringAsync(url);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      <Text className="text-sm font-semibold text-[#0B73FF]">
                        {copied ? "Copied" : "Copy"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          ) : null}
        </View>
      </View>

      {!imageLoaded ? (
        <View className="absolute inset-0 bg-white animate-pulse">
          <View className="h-48 w-full bg-slate-200" />
          <View className="px-4 py-4 gap-3">
            <View className="h-3 w-28 rounded bg-slate-200" />
            <View className="h-5 w-44 rounded bg-slate-200" />
            <View className="h-3 w-36 rounded bg-slate-200" />
            <View className="h-10 rounded-full bg-slate-200" />
          </View>
        </View>
      ) : null}

      <EventEmailModal
        visible={showEmail}
        onClose={() => setShowEmail(false)}
        event={item}
        onInviteSent={onInviteSent}
      />
    </Container>
  );
}

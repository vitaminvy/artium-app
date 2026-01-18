import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/domains/auth/contexts/AuthContext";
import {
  subscribeToChatMessages,
  sendMessage,
  subscribeToInbox,
} from "../services/chatService";
import { ChatMessage, ChatRoom } from "../types";

export function useChat(chatId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = subscribeToChatMessages(chatId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = useCallback(
    async (newMessages: ChatMessage[] = []) => {
      if (!currentUser || newMessages.length === 0) return;

      const text = newMessages[0].text;
      const sender = {
        _id: currentUser.uid,
        name: currentUser.displayName || "User",
        avatar: currentUser.photoURL || undefined,
      };

      try {
        await sendMessage(chatId, text, sender);
      } catch (error) {
        console.error("Failed to send message", error);
      }
    },
    [chatId, currentUser]
  );

  return { messages, onSend, currentUser };
}

export function useInbox() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToInbox(currentUser.uid, (data) => {
      setRooms(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { rooms, loading, currentUser };
}

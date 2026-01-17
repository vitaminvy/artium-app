import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { ChatRoom, ChatMessage } from "../types";
import { User } from "firebase/auth";

// Helper to generate consistent Chat ID for 1-1 chats
export const getChatRoomId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export const createOrGetChatRoom = async (
  currentUser: User,
  targetUserId: string,
  targetUserData: { displayName: string; photoURL?: string }
): Promise<string> => {
  const chatId = getChatRoomId(currentUser.uid, targetUserId);
  const chatRef = doc(firestore, "chats", chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    // Create new chat room
    const newRoom: Omit<ChatRoom, "id"> = {
      participants: [currentUser.uid, targetUserId],
      participantData: {
        [currentUser.uid]: {
          displayName: currentUser.displayName || "User",
          photoURL: currentUser.photoURL || undefined,
        },
        [targetUserId]: {
          displayName: targetUserData.displayName,
          photoURL: targetUserData.photoURL,
        },
      },
      updatedAt: serverTimestamp() as Timestamp,
      createdAt: serverTimestamp() as Timestamp,
    };
    await setDoc(chatRef, newRoom);
  } else {
    // Optional: Update participant data if it changed (e.g. new avatar)
    await updateDoc(chatRef, {
      [`participantData.${currentUser.uid}`]: {
        displayName: currentUser.displayName || "User",
        photoURL: currentUser.photoURL || undefined,
      },
      [`participantData.${targetUserId}`]: {
        displayName: targetUserData.displayName,
        photoURL: targetUserData.photoURL,
      },
    });
  }

  return chatId;
};

export const sendMessage = async (
  chatId: string,
  text: string,
  sender: { _id: string; name: string; avatar?: string }
) => {
  const chatRef = doc(firestore, "chats", chatId);
  const messagesRef = collection(chatRef, "messages");

  const messageData = {
    text,
    createdAt: serverTimestamp(),
    user: sender,
  };

  // 1. Add message to subcollection
  await addDoc(messagesRef, messageData);

  // 2. Update lastMessage in chat room
  await updateDoc(chatRef, {
    lastMessage: {
      text,
      createdAt: serverTimestamp(),
      senderId: sender._id,
      seen: false,
    },
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = collection(firestore, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        _id: doc.id,
        text: data.text,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        user: data.user,
      } as ChatMessage;
    });
    callback(messages);
  });
};

export const subscribeToInbox = (
  userId: string,
  callback: (rooms: ChatRoom[]) => void
) => {
  const chatsRef = collection(firestore, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const rooms = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatRoom[];
    callback(rooms);
  });
};

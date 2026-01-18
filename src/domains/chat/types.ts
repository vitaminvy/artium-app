import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: number | Date; // GiftedChat prefers number or Date
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  image?: string;
  sent?: boolean;
  received?: boolean;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantData: {
    [uid: string]: {
      displayName: string;
      photoURL?: string;
    };
  };
  lastMessage?: {
    text: string;
    createdAt: Timestamp;
    senderId: string;
    seen: boolean;
  };
  updatedAt: Timestamp;
  createdAt: Timestamp;
}
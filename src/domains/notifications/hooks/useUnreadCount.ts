import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { useAuth } from "../../auth/contexts/AuthContext";

export function useUnreadNotificationsCount() {
  const { currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }

    const ref = collection(firestore, "users", currentUser.uid, "notifications");
    const q = query(ref, where("read", "==", false));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setUnreadCount(snapshot.size);
      },
      (error) => {
        console.warn("Error fetching unread notifications count:", error);
        setUnreadCount(0);
      }
    );

    return () => unsub();
  }, [currentUser]);

  return unreadCount;
}

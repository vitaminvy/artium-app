import { collection, query, where, getDocs, writeBatch, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/configs/firebase";

/**
 * Mark all unread notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(firestore, "users", userId, "notifications");
    const q = query(notificationsRef, where("read", "==", false));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("No unread notifications to mark as read");
      return;
    }

    // Use batch to update all at once (max 500 per batch)
    const batch = writeBatch(firestore);

    snapshot.docs.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, { read: true });
    });

    await batch.commit();
    console.log(`Marked ${snapshot.size} notifications as read`);
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const notificationRef = doc(firestore, "users", userId, "notifications", notificationId);
    await updateDoc(notificationRef, { read: true });
    console.log(`Marked notification ${notificationId} as read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

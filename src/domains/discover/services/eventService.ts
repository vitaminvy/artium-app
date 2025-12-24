import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { EventItem } from "../types";

const EVENTS_COLLECTION = "events";

export type PaginatedEventsResult = {
  events: EventItem[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
};

/**
 * Fetches a paginated list of events.
 */
export const getEvents = async (
  pageSize: number,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedEventsResult> => {
  try {
    let eventsQuery;
    const baseQuery = [
      collection(firestore, EVENTS_COLLECTION),
      orderBy("startDate", "desc"),
      limit(pageSize),
    ];

    if (lastVisible) {
      eventsQuery = query(baseQuery[0], baseQuery[1], startAfter(lastVisible), baseQuery[2]);
    } else {
      eventsQuery = query(baseQuery[0], baseQuery[1], baseQuery[2]);
    }

    const snapshot = await getDocs(eventsQuery);
    const events = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Convert Firestore Timestamps to JS Date objects for the component
      return {
        id: doc.id,
        title: data.title,
        image: data.image,
        location: data.location.city,
        startDate: (data.startDate as Timestamp).toDate(),
        attendees: data.attendeeCount,
        isOnline: data.isOnline,
      } as EventItem;
    });

    return {
      events,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
};

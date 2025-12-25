import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  QueryDocumentSnapshot,
  DocumentData,
  Timestamp,
  DocumentSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { EventItem } from "../types";

const EVENTS_COLLECTION = "events";

export type PaginatedEventsResult = {
  events: EventItem[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
};

const mapEventDoc = (doc: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): EventItem => {
  const data = doc.data() || {};
  const start = (data.startDate as Timestamp | undefined)?.toDate?.() ?? new Date();
  const end = (data.endDate as Timestamp | undefined)?.toDate?.();
  const now = new Date();
  const status =
    end && now > start && now <= end
      ? "ongoing"
      : now > start
        ? "past"
        : "upcoming";
  const timeLabel = start.toLocaleString("en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return {
    id: doc.id,
    title: data.title ?? "Untitled event",
    image: data.image ?? "",
    location:
      data.location?.city ??
      data.location?.name ??
      data.location?.address ??
      (data.isOnline ? "Online" : "Unknown"),
    startDate: start.toISOString(),
    datetime: start.toISOString(),
    endDatetime: end?.toISOString(),
    attendees: data.attendeeCount ?? 0,
    isOnline: data.isOnline ?? false,
    eventType: data.tags?.[0] ?? data.category ?? "Other",
    category: Array.isArray(data.tags) ? data.tags.join(", ") : data.category,
    status,
    timeLabel,
    rsvpLabel: "RSVP",
    description: data.description,
    websiteUrl: data.websiteUrl,
    timeZone: data.timeZone,
    visibility: data.visibility,
  } as EventItem;
};

/**
 * Fetches a paginated list of events.
 */
export const getEvents = async (
  pageSize: number,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedEventsResult> => {
  try {
    const base = [collection(firestore, EVENTS_COLLECTION), orderBy("startDate", "desc"), limit(pageSize)];
    const eventsQuery = lastVisible
      ? query(base[0], base[1], startAfter(lastVisible), base[2])
      : query(base[0], base[1], base[2]);

    const snapshot = await getDocs(eventsQuery);
    const events = snapshot.docs.map((doc) => {
      return mapEventDoc(doc);
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

export type EventWithRaw = { event: EventItem; raw: DocumentData };

export const getEventById = async (id: string): Promise<EventWithRaw | null> => {
  try {
    const ref = doc(firestore, EVENTS_COLLECTION, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const event = mapEventDoc(snap as QueryDocumentSnapshot<DocumentData>);
    return { event, raw: snap.data() };
  } catch (error) {
    console.error("Error getting event by id:", error);
    throw error;
  }
};

export const createEvent = async (event: EventItem): Promise<EventItem> => {
  const start = event.datetime || event.startDate ? new Date(event.datetime ?? event.startDate!) : new Date();
  const end = event.endDatetime ? new Date(event.endDatetime) : null;
  const tags = event.category
    ? event.category.split(",").map((t) => t.trim()).filter(Boolean)
    : event.eventType
      ? [event.eventType]
      : [];
  const payload: any = {
    title: event.title,
    image: event.image,
    startDate: start,
    endDate: end,
    attendeeCount: event.attendees ?? 0,
    isOnline: event.isOnline ?? false,
    location: {
      city: event.location,
      address: event.location,
      name: event.location,
    },
    tags,
    category: event.eventType ?? event.category,
    description: (event as any).description,
    timeZone: (event as any).timeZone ?? "UTC",
    visibility: (event as any).visibility ?? (event.isOnline ? "online" : "public"),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    organizerId: (event as any).organizerId,
    organizerSnapshot: (event as any).organizerSnapshot,
  };
  const docRef = await addDoc(collection(firestore, EVENTS_COLLECTION), payload);
  return { ...event, id: docRef.id, datetime: start.toISOString(), startDate: start.toISOString(), endDatetime: end?.toISOString(), category: tags.join(", ") };
};

export const getEventsByOrganizer = async (
  organizerId: string,
  pageSize: number = 20,
  lastVisible: QueryDocumentSnapshot<DocumentData> | null = null
): Promise<PaginatedEventsResult> => {
  try {
    const base = [
      collection(firestore, EVENTS_COLLECTION),
      where("organizerId", "==", organizerId),
      orderBy("startDate", "desc"),
      limit(pageSize),
    ];
    const eventsQuery = lastVisible
      ? query(base[0], base[1], base[2], startAfter(lastVisible), base[3])
      : query(base[0], base[1], base[2], base[3]);

    const snapshot = await getDocs(eventsQuery);
    const events = snapshot.docs.map((doc) => mapEventDoc(doc));
    return {
      events,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error("Error getting organizer events:", error);
    throw error;
  }
};

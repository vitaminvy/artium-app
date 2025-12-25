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
  collectionGroup,
  setDoc,
  getCountFromServer,
  writeBatch
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { EventItem } from "../types";
import { EventGuest } from "@/domains/events/types";

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
  
  // Ensure we have an organizer ID. If not present in the event object, it might be added by the UI layer.
  // Ideally, the UI should pass the current user's ID as organizerId.
  // The 'organizerId' is hidden in 'event' as 'any' in some calls, let's make it explicit.
  const organizerId = (event as any).organizerId;
  
  if (!organizerId) {
      console.warn("Creating event without organizerId. Firestore rules might reject this.");
  }

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
    description: (event as any).description ?? "",
    timeZone: (event as any).timeZone ?? "UTC",
    visibility: (event as any).visibility ?? (event.isOnline ? "online" : "public"),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    organizerId: organizerId,
    organizerSnapshot: (event as any).organizerSnapshot || {},
  };
  
  try {
    const docRef = await addDoc(collection(firestore, EVENTS_COLLECTION), payload);
    return { ...event, id: docRef.id, datetime: start.toISOString(), startDate: start.toISOString(), endDatetime: end?.toISOString(), category: tags.join(", ") };
  } catch (e) {
    console.error("Failed to create event in Firestore:", e);
    throw e;
  }
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

export const fetchEventsByIds = async (ids: string[]): Promise<EventItem[]> => {
  if (!ids.length) return [];
  try {
    // Firestore 'in' query supports max 10 items.
    // We need to batch requests or just fetch individually.
    // Fetching individually in parallel is often simpler for < 30 items.
    
    const promises = ids.map(id => getEventById(id));
    const results = await Promise.all(promises);
    return results
      .filter((r): r is EventWithRaw => r !== null)
      .map(r => r.event);
  } catch (error) {
    console.error("Error fetching events by IDs:", error);
    return [];
  }
};

// --- RSVP SERVICES ---

export const fetchUserRsvps = async (userId: string) => {
  try {
    const q = query(collection(firestore, "users", userId, "event_rsvps"));
    const snapshot = await getDocs(q);
    const rsvpMap: Record<string, "going" | "maybe" | "notGoing"> = {};
    const eventIds: string[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status) {
        rsvpMap[doc.id] = data.status;
        if (data.status !== 'notGoing') {
           eventIds.push(doc.id);
        }
      }
    });
    return { rsvpMap, eventIds };
  } catch (error) {
    console.error("Error fetching user RSVPs:", error);
    return { rsvpMap: {}, eventIds: [] };
  }
};

export const toggleEventRsvp = async (
  userId: string,
  eventId: string,
  status: "going" | "maybe" | "notGoing"
) => {
  try {
    const ref = doc(firestore, "users", userId, "event_rsvps", eventId);
    await setDoc(ref, {
      eventId,
      status,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error toggling RSVP:", error);
    throw error;
  }
};

export const fetchEventGuestCounts = async (eventId: string) => {
  try {
    const rsvpsRef = collectionGroup(firestore, "event_rsvps");
    
    const goingQuery = query(rsvpsRef, where("eventId", "==", eventId), where("status", "==", "going"));
    const maybeQuery = query(rsvpsRef, where("eventId", "==", eventId), where("status", "==", "maybe"));

    const [goingSnap, maybeSnap] = await Promise.all([
      getCountFromServer(goingQuery),
      getCountFromServer(maybeQuery)
    ]);

    return {
      going: goingSnap.data().count,
      maybe: maybeSnap.data().count
    };
  } catch (error) {
    console.error("Error counting guests:", error);
    return { going: 0, maybe: 0 };
  }
};

export const fetchEventGuests = async (eventId: string): Promise<EventGuest[]> => {
  try {
    const rsvpsRef = collectionGroup(firestore, "event_rsvps");
    const q = query(rsvpsRef, where("eventId", "==", eventId));
    
    // Limit to 50 guests for performance in this demo
    // In a real app, we would paginate this
    const snapshot = await getDocs(query(q, limit(50)));
    
    const guests: EventGuest[] = [];
    
    // We need to fetch user details for each RSVP
    // Using promise.all with map might trigger too many reads at once if 50+
    // But for <50 it's fine.
    
    const userPromises = snapshot.docs.map(async (rsvpDoc) => {
      const data = rsvpDoc.data();
      // The parent of 'event_rsvps' is the user doc
      // Path: users/{uid}/event_rsvps/{eventId}
      const userRef = rsvpDoc.ref.parent.parent;
      
      if (userRef) {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
           const userData = userSnap.data();
           return {
             id: userSnap.id,
             name: userData.displayName || "Unknown User",
             status: data.status,
             // Fallbacks for missing schema fields
             ticketType: "General", 
             quantity: 1,
             avatar: userData.photoURL
           } as EventGuest;
        }
      }
      return null;
    });

    const results = await Promise.all(userPromises);
    return results.filter(Boolean) as EventGuest[];

  } catch (error) {
    console.error("Error fetching event guests:", error);
    return [];
  }
};


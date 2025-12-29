import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

type NotificationPayload = {
  type: "like" | "comment" | "reshare";
  actorId: string;
  actorName: string;
  postId: string;
  message: string;
};

const getUserName = async (uid: string): Promise<string> => {
  try {
    const snap = await db.collection("users").doc(uid).get();
    if (snap.exists) {
      const data = snap.data() || {};
      return (
        data.displayName ||
        data.name ||
        data.username ||
        data.email ||
        "Someone"
      );
    }
  } catch (err) {
    console.warn("Failed to fetch user name", err);
  }
  return "Someone";
};

const createNotification = async (
  targetUserId: string,
  payload: NotificationPayload
) => {
  const ref = db
    .collection("users")
    .doc(targetUserId)
    .collection("notifications")
    .doc();

  await ref.set({
    ...payload,
    createdAt: FieldValue.serverTimestamp(),
    read: false,
  });
};

// Scheduled function to recalc popularity scores every hour
export const calculatePopularityScores = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    const artworksRef = db.collection("artworks");
    const snapshot = await artworksRef.get();

    if (snapshot.empty) {
      console.log("No artworks found.");
      return null;
    }

    const batch = db.batch();

    snapshot.forEach((doc) => {
      const artwork = doc.data();
      const metrics = artwork.metrics || {likes: 0, views: 0};

      // Assumes you have a 'createdAt' Firestore Timestamp; fallback to now
      // to avoid NaN.
      const createdAt = artwork.createdAt?.toDate?.() || new Date();

      // --- Scoring Formula ---
      const points = (metrics.likes || 0) * 2 + (metrics.views || 0) * 0.5;
      const hoursSinceCreation =
        (Date.now() - createdAt.getTime()) / 3_600_000;
      const gravity = 1.8; // Gravity factor
      const score = points / Math.pow(hoursSinceCreation + 2, gravity);
      // -----------------------

      const artworkRefToUpdate = artworksRef.doc(doc.id);
      batch.update(artworkRefToUpdate, {popularityScore: score});
    });

    await batch.commit();
    console.log(`Updated popularity scores for ${snapshot.size} artworks.`);
    return null;
  });

// Notify post author when someone likes their post
export const onPostLike = functions.firestore
  .document("posts/{postId}/likes/{userId}")
  .onCreate(async (snap, context) => {
    const {postId, userId} = context.params;
    console.log("=== onPostLike triggered ===", {postId, userId});
    try {
      const postSnap = await db.collection("posts").doc(postId).get();
      if (!postSnap.exists) {
        console.log("Post not found:", postId);
        return null;
      }
      const postData = postSnap.data() || {};
      console.log("Post data:", JSON.stringify(postData, null, 2));
      const authorId =
        postData.authorId ||
        postData.authorSnapshot?.id ||
        postData.author?.id ||
        postData.userId;
      console.log("Extracted authorId:", authorId, "actorId (userId):", userId);
      if (!authorId) {
        console.log("No authorId found in post");
        return null;
      }
      if (authorId === userId) {
        console.log("Self-like detected, skipping notification");
        return null;
      }

      console.log("Creating notification for authorId:", authorId);
      const actorName = await getUserName(userId);
      console.log("Actor name:", actorName);
      await createNotification(authorId, {
        type: "like",
        actorId: userId,
        actorName,
        postId,
        message: `${actorName} liked your post`,
      });
      console.log("Notification created successfully");
    } catch (err) {
      console.error("onPostLike failed", err);
    }
    return null;
  });

// Notify artwork owner when someone likes their artwork
export const onArtworkLike = functions.firestore
  .document("artworks/{artworkId}/likes/{userId}")
  .onCreate(async (_snap, context) => {
    const {artworkId, userId} = context.params;
    try {
      const artworkSnap = await db.collection("artworks").doc(artworkId).get();
      if (!artworkSnap.exists) return null;
      const artwork = artworkSnap.data() || {};
      const authorId = artwork.authorId || artwork.artistId;
      if (!authorId || authorId === userId) return null;

      console.log("onArtworkLike create notification", {
        artworkId,
        actorId: userId,
        authorId,
      });
      const actorName = await getUserName(userId);
      const title = artwork.title ? ` "${artwork.title}"` : "";
      await createNotification(authorId, {
        type: "like",
        actorId: userId,
        actorName,
        postId: artworkId,
        message: `${actorName} liked your artwork${title}`,
      });
    } catch (err) {
      console.error("onArtworkLike failed", err);
    }
    return null;
  });

// Notify post author when someone comments
export const onPostComment = functions.firestore
  .document("posts/{postId}/comments/{commentId}")
  .onCreate(async (snap, context) => {
    const {postId} = context.params;
    const data = snap.data() || {};
    const actorId = data.author?.id || data.author?.uid || data.authorId;
    if (!actorId) return null;

    try {
      const postSnap = await db.collection("posts").doc(postId).get();
      if (!postSnap.exists) return null;
      const postData = postSnap.data() || {};
      const authorId = postData.authorId;
      if (!authorId || authorId === actorId) return null;

      const actorName = data.author?.name || (await getUserName(actorId));
      await createNotification(authorId, {
        type: "comment",
        actorId,
        actorName,
        postId,
        message: `${actorName} commented on your post`,
      });
    } catch (err) {
      console.error("onPostComment failed", err);
    }
    return null;
  });

// Notify original author when someone reshares
export const onPostReshare = functions.firestore
  .document("posts/{postId}")
  .onCreate(async (snap) => {
    const data = snap.data() || {};
    if (!data.isReshare) return null;
    const targetAuthorId = data.resharedFrom?.id || data.resharedFrom?.authorId;
    const actorId = data.authorId;
    if (!targetAuthorId || !actorId || targetAuthorId === actorId) return null;

    try {
      const actorName =
        data.authorSnapshot?.name || (await getUserName(actorId));
      await createNotification(targetAuthorId, {
        type: "reshare",
        actorId,
        actorName,
        postId: snap.id,
        message: `${actorName} reshared your post`,
      });
    } catch (err) {
      console.error("onPostReshare failed", err);
    }
    return null;
  });

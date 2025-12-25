import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

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

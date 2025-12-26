import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import { uploadRandomImage } from "./uploadToStorage";

dotenv.config();

const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), "serviceAccount.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ ERROR: serviceAccount.json not found in project root.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const BATCH_SIZE = 100;

const isStorageUrl = (url?: string) => {
  if (!url) return false;
  return (
    url.includes("firebasestorage.googleapis.com") ||
    url.includes("storage.googleapis.com")
  );
};

async function backfillEventImages() {
  console.log("🚀 Backfilling event images to Firebase Storage...");
  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  let totalUpdated = 0;

  while (true) {
    let queryRef = db
      .collection("events")
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(BATCH_SIZE);

    if (lastDoc) {
      queryRef = queryRef.startAfter(lastDoc);
    }

    const snapshot = await queryRef.get();
    if (snapshot.empty) break;

    const updates: {
      ref: FirebaseFirestore.DocumentReference;
      image: string;
    }[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data() || {};
      const image = typeof data.image === "string" ? data.image : "";
      const shouldUpdate =
        !image || image.startsWith("file://") || !isStorageUrl(image);

      if (!shouldUpdate) continue;

      const uploaded = await uploadRandomImage("events");
      updates.push({ ref: doc.ref, image: uploaded });
    }

    if (updates.length) {
      const batch = db.batch();
      updates.forEach((update) => {
        batch.update(update.ref, {
          image: update.image,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      totalUpdated += updates.length;
      console.log(`✅ Updated ${totalUpdated} events...`);
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
  }

  console.log(`🎉 Done. Updated ${totalUpdated} events.`);
  process.exit(0);
}

backfillEventImages().catch((error) => {
  console.error("❌ Failed to backfill event images:", error);
  process.exit(1);
});

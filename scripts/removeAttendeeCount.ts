import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), "serviceAccount.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ ERROR: serviceAccount.json not found in project root.");
  console.error("   Please download it from Firebase Console -> Project Settings -> Service Accounts.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const BATCH_SIZE = 400;

async function removeAttendeeCount() {
  console.log("🚀 Removing attendeeCount from events...");

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

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        attendeeCount: admin.firestore.FieldValue.delete(),
      });
    });

    await batch.commit();
    totalUpdated += snapshot.size;
    lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

    console.log(`✅ Updated ${totalUpdated} events...`);
  }

  console.log(`🎉 Done. Removed attendeeCount from ${totalUpdated} events.`);
  process.exit(0);
}

removeAttendeeCount().catch((error) => {
  console.error("❌ Failed to remove attendeeCount:", error);
  process.exit(1);
});

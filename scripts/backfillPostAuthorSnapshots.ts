import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

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
  });
}

const db = admin.firestore();
const BATCH_SIZE = 400;

type UserDoc = {
  email?: string;
  displayName?: string;
  photoURL?: string | null;
  avatarUri?: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
};

const buildDisplayName = (data: UserDoc) => {
  const firstName = (data.firstName ?? "").trim();
  const lastName = (data.lastName ?? "").trim();
  const composed = [firstName, lastName].filter(Boolean).join(" ").trim();
  return composed || (data.displayName ?? "").trim() || (data.email ?? "").trim() || "User";
};

const buildHandle = (data: UserDoc, displayName: string) => {
  const username = (data.username ?? "").trim().replace(/^@/, "");
  if (username) return username;
  const email = (data.email ?? "").trim();
  if (email) return email.split("@")[0];
  return displayName.replace(/\s+/g, "").toLowerCase() || "user";
};

const buildAuthorSnapshot = (userId: string, data: UserDoc) => {
  const displayName = buildDisplayName(data);
  const handle = buildHandle(data, displayName);
  const avatar = data.avatarUri ?? data.photoURL ?? null;
  return {
    id: userId,
    name: displayName,
    handle,
    avatar,
  };
};

async function backfillPostAuthorSnapshots() {
  console.log("🚀 Backfilling post authorSnapshot from users...");

  const usersSnap = await db.collection("users").get();
  const usersById = new Map<string, UserDoc>();
  usersSnap.forEach((doc) => usersById.set(doc.id, doc.data() as UserDoc));
  console.log(`✅ Loaded ${usersById.size} users`);

  let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  let totalUpdated = 0;
  let totalScanned = 0;

  while (true) {
    let queryRef = db
      .collection("posts")
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(BATCH_SIZE);

    if (lastDoc) {
      queryRef = queryRef.startAfter(lastDoc);
    }

    const snapshot = await queryRef.get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      totalScanned += 1;
      const data = doc.data() as { authorId?: string };
      const authorId = data.authorId;
      if (!authorId) return;
      const userDoc = usersById.get(authorId);
      if (!userDoc) return;
      const authorSnapshot = buildAuthorSnapshot(authorId, userDoc);
      batch.update(doc.ref, { authorSnapshot });
      totalUpdated += 1;
    });

    await batch.commit();
    lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
    console.log(`✅ Scanned ${totalScanned} posts, updated ${totalUpdated}...`);
  }

  console.log(`🎉 Done. Updated ${totalUpdated} posts.`);
  process.exit(0);
}

backfillPostAuthorSnapshots().catch((error) => {
  console.error("❌ Backfill failed:", error);
  process.exit(1);
});

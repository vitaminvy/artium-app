import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as path from "path";
import { config as loadEnv } from "dotenv";

// --- CONFIGURATION ---
// Ensure environment variables are loaded
loadEnv(); 

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
const EDITORIALS_COLLECTION = "editorials";
const NUM_EDITORIALS = 20;

/**
 * Generates a single realistic editorial document.
 */
function createEditorialDoc() {
  const authorName = faker.helpers.arrayElement([
    "Artium Editorial",
    "Guest Curator",
    faker.person.fullName(),
    "Art History Today",
  ]);

  return {
    title: faker.lorem.sentence({ min: 5, max: 12 }),
    coverImage: faker.image.urlLoremFlickr({ category: 'art,gallery,sculpture', width: 1280, height: 720 }),
    excerpt: faker.lorem.paragraph(2).slice(0, 200),
    publishedAt: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 30 })),
    authorName,
  };
}

/**
 * Deletes all documents in a collection.
 * This is useful for a clean reset before seeding.
 */
async function clearCollection(collectionPath: string) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.limit(500).get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  
  // Recurse if there are more documents to delete
  if (snapshot.size === 500) {
    await clearCollection(collectionPath);
  }
}

/**
 * Seeds the 'editorials' collection in Firestore.
 */
async function seedEditorials() {
  console.log(`\n🌱 Seeding ${NUM_EDITORIALS} editorial documents...`);

  // To ensure idempotency, we first clear the collection.
  console.log(`   🔥 Clearing existing data from '${EDITORIALS_COLLECTION}'...`);
  await clearCollection(EDITORIALS_COLLECTION);
  
  const batch = db.batch();

  for (let i = 0; i < NUM_EDITORIALS; i++) {
    // We use a predictable ID format, but clearing is safer.
    const docRef = db.collection(EDITORIALS_COLLECTION).doc(); 
    const editorialData = createEditorialDoc();
    batch.set(docRef, editorialData);
  }

  await batch.commit();
  console.log(`✅ Successfully seeded ${NUM_EDITORIALS} documents into '${EDITORIALS_COLLECTION}'.`);
}


async function main() {
    console.log("🚀 STARTING EDITORIAL SEED SCRIPT...");
    try {
        await seedEditorials();
        console.log("\n🎉 Editorial seed complete!");
        process.exit(0);
    } catch (error) {
        console.error("\n❌ SEED FAILED:", error);
        process.exit(1);
    }
}

main();

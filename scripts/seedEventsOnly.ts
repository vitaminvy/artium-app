import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

import { seedEvents } from "./seedEvents";
import { SeededUser } from "./seedUsers"; // Import for type definition

// --- CONFIGURATION ---
const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), "serviceAccount.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ ERROR: serviceAccount.json not found in project root.");
  console.error("   Please download it from Firebase Console -> Project Settings -> Service Accounts.");
  process.exit(1);
}

// Initialize Firebase Admin
config(); // Load environment variables
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com" // Fallback
  });
}

const db = admin.firestore();

async function main() {
  console.log("🚀 STARTING ADMIN SEED FOR EVENTS ONLY...");
  
  try {
    // Fetch existing users to use as organizers
    console.log("   Fetching existing users from Firestore...");
    const usersSnapshot = await db.collection("users").get();
    const existingUsers: SeededUser[] = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        isArtist: data.roles?.isArtist || false, // Assuming roles exist
      };
    });

    if (existingUsers.length === 0) {
      console.warn("⚠️ No existing users found. Please run the full seed script first if you want users to be created.");
      console.log("   Exiting event seeding.");
      process.exit(0);
    }

    console.log(`   Found ${existingUsers.length} existing users.`);

    // 1. Seed Events (10 per User)
    await seedEvents(db, existingUsers, 10);

    console.log("\n🎉 EVENT SEED COMPLETE!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ EVENT SEED FAILED:", error);
    process.exit(1);
  }
}

main();

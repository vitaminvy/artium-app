import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import * as path from "path";

import { seedUsers } from "./seedUsers";
import { seedArtists } from "./seedArtists";
import { seedArtworks } from "./seedArtworks";
import { seedPosts } from "./seedPosts";

// --- CONFIGURATION ---
const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), "serviceAccount.json");
const STORAGE_BUCKET = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET; 
// If env var is missing, you might need to hardcode it or ensure .env is loaded

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ ERROR: serviceAccount.json not found in project root.");
  console.error("   Please download it from Firebase Console -> Project Settings -> Service Accounts.");
  process.exit(1);
}

// Initialize Firebase Admin
// We need to load dotenv manually if running via simple tsx without preloading
import { config } from "dotenv";
config(); 

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com" // Fallback
  });
}

const db = admin.firestore();

async function main() {
  console.log("🚀 STARTING ADMIN SEED...");
  console.log(`   Bucket: ${admin.app().options.storageBucket}`);
  
  // Set consistent seed for Faker
  faker.seed(123);

  try {
    // 1. Seed Users (100)
    const users = await seedUsers(db, 100);

    // 2. Promote Artists (40)
    const artists = await seedArtists(db, users, 40);

    // 3. Seed Artworks (30 per Artist)
    await seedArtworks(db, artists, 30);

    // 4. Seed Posts (10 per User)
    await seedPosts(db, users, 10);

    console.log("\n🎉 SEED COMPLETE! The database is populated.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ SEED FAILED:", error);
    process.exit(1);
  }
}

main();

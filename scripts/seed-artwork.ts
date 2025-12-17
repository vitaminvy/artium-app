
import path from "path";
import { config as loadEnv } from "dotenv";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Load .env.local explicitly so the seed script has the same config as the app
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[seed-artwork] Missing env var: ${key}`);
  }
  return value;
};

// Use the same Firebase config as src/configs/firebase.ts
const firebaseConfig = {
  apiKey: requireEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requireEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requireEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requireEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requireEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requireEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedArtwork() {
  // Use the User's UID as the Artist ID, as we decided.
  const artistId = "Ay5dNcn01qZQQR64lU0tGehh4Sz2"; 
  const artworkId = "artwork-august";

  // Seed the artist document first. The document ID is the user's UID.
  await setDoc(doc(db, "artists", artistId), {
    name: "Jeff Yarrington",
    avatar:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
    verified: true,
    bio: "An artist exploring the intersection of nature and technology.",
  });

  // Then seed the artwork document. Its `artistId` field points to the user's UID.
  await setDoc(doc(db, "artworks", artworkId), {
    artistId, // This will be "Ay5dNcn01qZQQR64lU0tGehh4Sz2"
    title: "August",
    stats: {
      worksSold: 4,
      buyers: 3,
    },
    // --- ADD NEW FIELDS FOR TRENDING ---
    metrics: {
      views: 0,
      likes: 0,
      shares: 0,
    },
    popularityScore: 0,
    createdAt: new Date(),
    // ------------------------------------
    price: "USD $550",
    availabilityNote: "Only 1 available. Get yours now!",
    images: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
    ],
    tags: ["Joyful", "Natural", "Vibrant"],
    dimension: { h: 24, w: 30, d: 2, unit: "in" },
    weight: "8.00 lbs",
    year: 2025,
    edition: 1,
    materials: "Acrylic on canvas with real wood floating frame",
    shipping: [{ title: "Shipped within 7 working days in a box" }],
  });

  console.log(`✅ Seeded artist ${artistId} and artwork ${artworkId} successfully`);
}

seedArtwork()
  .then(() => {
    console.log("🎉 Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seed failed", err);
    process.exit(1);
  });

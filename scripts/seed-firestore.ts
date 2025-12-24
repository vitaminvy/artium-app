import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  setDoc, 
  doc, 
  collection, 
  addDoc, 
  Timestamp,
  writeBatch
} from "firebase/firestore";

// --- 1. CONFIGURATION ---
const envPath = path.resolve(process.cwd(), ".env");
const envLocalPath = path.resolve(process.cwd(), ".env.local");
loadEnv({ path: envPath });
if (fs.existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath, override: true });
}

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

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

// --- 2. HELPERS ---
const parsePrice = (priceStr: string) => {
  // Input: "USD $550" or "USD $1,200"
  // Output: { amount: 550, currency: "USD" }
  const match = priceStr.match(/^([A-Z]{3})\s\$([\d,]+)/);
  if (match) {
    return {
      currency: match[1],
      amount: parseInt(match[2].replace(/,/g, ""), 10),
    };
  }
  return { amount: 0, currency: "USD" }; // Fallback
};

const parseWeight = (weightStr: string) => {
  // Input: "8.00 lbs"
  // Output: { value: 8, unit: "lbs" }
  const match = weightStr.match(/^([\d.]+)\s([a-z]+)/i);
  if (match) {
    return {
      value: parseFloat(match[1]),
      unit: match[2].toLowerCase(),
    };
  }
  return { value: 0, unit: "kg" }; // Fallback
};

// Placeholder images for Feed (since we can't use local assets in Node)
const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80",
  "https://images.unsplash.com/photo-1515165562835-c3b8c9ea0f5b?w=800&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
];

// --- 3. DATA SEEDING LOGIC ---

// MOCK DATA (Hardcoded to ensure valid structure)
const SEED_USERS = [
  {
    id: "user-jeff",
    username: "jeff_yarrington",
    displayName: "Jeff Yarrington",
    email: "jeff@artium.example.com",
    photoURL: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&q=80",
    bio: "Exploring nature through technology.",
    roles: { isArtist: true, isAdmin: false },
    stats: { followers: 120, following: 15, artworks: 4, sold: 4 },
  },
  {
    id: "user-maria",
    username: "maria_rod",
    displayName: "Maria Rodriguez",
    email: "maria@artium.example.com",
    photoURL: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80",
    bio: "Abstract painter.",
    roles: { isArtist: true, isAdmin: false },
    stats: { followers: 890, following: 40, artworks: 12, sold: 10 },
  },
  {
    id: "user-collector",
    username: "art_lover",
    displayName: "Art Collector",
    email: "collector@artium.example.com",
    photoURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    bio: "Just looking for beautiful things.",
    roles: { isArtist: false, isAdmin: false },
    stats: { followers: 0, following: 100, artworks: 0, sold: 0 },
  }
];

const SEED_ARTWORKS = [
  {
    id: "aw-august",
    artistId: "user-jeff",
    title: "August",
    description: "A vibrant expression of late summer joy.",
    priceStr: "USD $550",
    weightStr: "8.00 lbs",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80"],
    materials: "Acrylic on canvas",
    year: 2025,
    dimension: { h: 24, w: 30, d: 2, unit: "in" },
    status: "for_sale",
    tags: ["Joyful", "Nature"],
    metrics: { likes: 12, views: 140, saves: 2 },
  },
  {
    id: "aw-city",
    artistId: "user-maria",
    title: "City Lights",
    description: "Urban chaos in oil.",
    priceStr: "USD $1,200",
    weightStr: "12.5 lbs",
    images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1100&q=80"],
    materials: "Oil on canvas",
    year: 2024,
    dimension: { h: 36, w: 48, d: 3, unit: "in" },
    status: "sold",
    tags: ["Urban", "Abstract"],
    metrics: { likes: 45, views: 300, saves: 10 },
  }
];

const SEED_POSTS = [
  {
    authorId: "user-jeff",
    content: "Just finished this piece! What do you think?",
    imageIndex: 0,
    metrics: { likes: 20, comments: 5, shares: 1 },
  },
  {
    authorId: "user-maria",
    content: "Visiting the gallery today. So inspiring.",
    imageIndex: 1,
    metrics: { likes: 55, comments: 12, shares: 4 },
  }
];

async function seed() {
  const batch = writeBatch(db);
  const now = new Date();
  
  console.log("🌱 Starting seed...");

  // 1. Seed Users
  for (const user of SEED_USERS) {
    const userRef = doc(db, "users", user.id);
    batch.set(userRef, {
      ...user,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
    
    // Add default address
    if (!user.roles.isArtist) {
       const addressRef = doc(collection(userRef, "addresses"));
       batch.set(addressRef, {
         firstName: "Demo",
         lastName: "User",
         address1: "123 Art St",
         city: "New York",
         state: "NY",
         country: "USA",
         isDefault: true,
       });
    }
  }
  console.log(`Prepared ${SEED_USERS.length} users.`);

  // 2. Seed Artworks
  for (const artwork of SEED_ARTWORKS) {
    const { priceStr, weightStr, ...rest } = artwork;
    const artist = SEED_USERS.find(u => u.id === rest.artistId);
    
    const artworkRef = doc(db, "artworks", rest.id);
    batch.set(artworkRef, {
      ...rest,
      artistSnapshot: {
        name: artist?.displayName,
        avatar: artist?.photoURL,
        verified: artist?.roles.isArtist
      },
      price: parsePrice(priceStr),
      weight: parseWeight(weightStr),
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    });
  }
  console.log(`Prepared ${SEED_ARTWORKS.length} artworks.`);

  // 3. Seed Posts
  for (const post of SEED_POSTS) {
    const { imageIndex, ...rest } = post;
    const author = SEED_USERS.find(u => u.id === rest.authorId);
    
    const postRef = doc(collection(db, "posts"));
    batch.set(postRef, {
      ...rest,
      authorSnapshot: {
        name: author?.displayName,
        handle: author?.username,
        avatar: author?.photoURL,
      },
      media: {
        type: "image",
        items: [{ uri: PLACEHOLDER_IMAGES[imageIndex], width: 800, height: 600 }]
      },
      createdAt: Timestamp.fromDate(now),
    });
  }
  console.log(`Prepared ${SEED_POSTS.length} posts.`);

  await batch.commit();
  console.log("✅ Database seeded successfully!");
}

seed().catch(console.error);

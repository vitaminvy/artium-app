
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
  const artists = [
    {
      id: "Ay5dNcn01qZQQR64lU0tGehh4Sz2", // Jeff Yarrington's UID
      name: "Jeff Yarrington",
      avatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80",
      verified: true,
      bio: "An artist exploring the intersection of nature and technology.",
    },
    {
      id: "user2-uid-example", // Maria Rodriguez's UID
      name: "Maria Rodriguez",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
      verified: false,
      bio: "Abstract painter inspired by nature's patterns.",
    },
    {
      id: "user3-uid-example", // Chen Wei's UID
      name: "Chen Wei",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80",
      verified: true,
      bio: "Digital artist creating immersive dreamscapes.",
    },
  ];

  for (const artist of artists) {
    await setDoc(doc(db, "artists", artist.id), artist);
    console.log(`✅ Seeded artist ${artist.name} (${artist.id})`);
  }

  const artworks = [
    {
      id: "artwork-august",
      artistId: "Ay5dNcn01qZQQR64l0tGehh4Sz2", // Use Jeff's ID
      title: "August",
      stats: { worksSold: 4, buyers: 3 },
      metrics: { views: 10, likes: 5, shares: 1 },
      popularityScore: 0, // Will be calculated by CF
      createdAt: new Date(new Date().setHours(new Date().getHours() - 10)), // 10 hours ago
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
    },
    {
      id: "artwork-city-lights",
      artistId: "user2-uid-example",
      title: "City Lights",
      stats: { worksSold: 10, buyers: 8 },
      metrics: { views: 50, likes: 15, shares: 3 },
      popularityScore: 0,
      createdAt: new Date(new Date().setHours(new Date().getHours() - 5)), // 5 hours ago
      price: "USD $1200",
      images: [
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
      ],
      tags: ["Urban", "Dynamic", "Abstract"],
      dimension: { h: 36, w: 48, d: 3, unit: "in" },
      weight: "12.00 lbs",
      year: 2024,
      edition: 5,
      materials: "Oil on canvas",
      shipping: [{ title: "Shipped rolled in a tube" }],
    },
    {
      id: "artwork-digital-dreamscape",
      artistId: "user3-uid-example",
      title: "Digital Dreamscape",
      stats: { worksSold: 2, buyers: 2 },
      metrics: { views: 20, likes: 8, shares: 2 },
      popularityScore: 0,
      createdAt: new Date(new Date().setHours(new Date().getHours() - 15)), // 15 hours ago
      price: "USD $800",
      images: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
      ],
      tags: ["Sci-Fi", "Vibrant", "Surreal"],
      dimension: { h: 20, w: 20, d: 1, unit: "in" },
      weight: "5.00 lbs",
      year: 2025,
      edition: 10,
      materials: "Printed on metallic paper",
      shipping: [{ title: "Shipped flat in a box" }],
    },
    {
      id: "artwork-quiet-reflection",
      artistId: "Ay5dNcn01qZQQR64l0tGehh4Sz2", // Use Jeff's ID
      title: "Quiet Reflection",
      stats: { worksSold: 7, buyers: 5 },
      metrics: { views: 30, likes: 10, shares: 1 },
      popularityScore: 0,
      createdAt: new Date(new Date().setHours(new Date().getHours() - 8)), // 8 hours ago
      price: "USD $700",
      images: [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      ],
      tags: ["Peaceful", "Minimalist", "Nature"],
      dimension: { h: 28, w: 22, d: 2, unit: "in" },
      weight: "6.00 lbs",
      year: 2023,
      edition: 3,
      materials: "Acrylic on wood panel",
      shipping: [{ title: "Shipped in protective packaging" }],
    },
  ];

  for (const artwork of artworks) {
    await setDoc(doc(db, "artworks", artwork.id), artwork);
    console.log(`✅ Seeded artwork ${artwork.title} (${artwork.id})`);
  }

  console.log("🎉 All artists and artworks seeded successfully!");
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


import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getFirestore, setDoc } from "firebase/firestore";

// Load .env.local explicitly so the seed script has the same config as the app
const envPath = path.resolve(process.cwd(), ".env");
const envLocalPath = path.resolve(process.cwd(), ".env.local");
loadEnv({ path: envPath });
if (fs.existsSync(envLocalPath)) {
  loadEnv({ path: envLocalPath, override: true });
}

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

const parseBoolean = (value?: string) =>
  value ? ["1", "true", "yes", "y"].includes(value.toLowerCase()) : false;

const pick = <T,>(items: T[], index: number) => items[index % items.length];

const buildTitle = (index: number) => {
  const adjectives = [
    "Silent",
    "Amber",
    "Electric",
    "Golden",
    "Hidden",
    "Luminous",
    "Crimson",
    "Velvet",
    "Solstice",
    "Azure",
    "Quiet",
    "Neon",
  ];
  const nouns = [
    "Horizon",
    "Bloom",
    "Echo",
    "Drift",
    "Garden",
    "Pulse",
    "River",
    "Rift",
    "Halo",
    "Cascade",
    "Signal",
    "Mirage",
  ];
  return `${pick(adjectives, index)} ${pick(nouns, index + 3)}`;
};

const imagePool = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1523419400524-1d9233d82db0?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1512238701577-f182d9ef8af7?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1100&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515165562835-c3b8c9ea0f5b?auto=format&fit=crop&w=1100&q=80",
];

const tagPool = [
  "Vibrant",
  "Minimal",
  "Surreal",
  "Urban",
  "Organic",
  "Dreamy",
  "Bold",
  "Calm",
  "Textured",
  "Moody",
  "Bright",
  "Soft",
];

const materialPool = [
  "Acrylic on canvas",
  "Oil on canvas",
  "Mixed media on wood",
  "Digital print on metallic paper",
  "Ink on paper",
  "Acrylic on wood panel",
];

const buildTags = (index: number) => {
  const tags = new Set<string>();
  tags.add(pick(tagPool, index));
  tags.add(pick(tagPool, index + 2));
  tags.add(pick(tagPool, index + 5));
  return Array.from(tags);
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seedDefaultArtworks = async () => {
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

};

const seedBulkForAuthor = async () => {
  const authorId = process.env.SEED_AUTHOR_ID;
  if (!authorId) {
    return;
  }

  const authorName =
    process.env.SEED_AUTHOR_NAME ||
    process.env.SEED_AUTHOR_EMAIL ||
    "Demo Artist";
  const authorAvatar =
    process.env.SEED_AUTHOR_AVATAR ||
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80";
  const count = Math.max(1, Number(process.env.SEED_COUNT || 12));

  await setDoc(
    doc(db, "artists", authorId),
    {
      id: authorId,
      name: authorName,
      avatar: authorAvatar,
      verified: false,
      bio: "Seeded artist profile for UI preview.",
    },
    { merge: true }
  );

  for (let i = 0; i < count; i += 1) {
    const title = buildTitle(i);
    const price = randomBetween(180, 2400);
    const height = randomBetween(18, 48);
    const width = randomBetween(18, 48);
    const depth = randomBetween(1, 4);
    const createdAt = new Date(Date.now() - i * 3_600_000);
    const images = [
      pick(imagePool, i),
      pick(imagePool, i + 1),
    ];

    await addDoc(collection(db, "artworks"), {
      authorId,
      authorName,
      artistId: authorId,
      artist: {
        name: authorName,
        avatar: authorAvatar,
        verified: false,
      },
      title,
      description: "Seeded artwork for UI preview.",
      year: 2025,
      edition: randomBetween(1, 10),
      materials: pick(materialPool, i),
      price: `USD $${price}`,
      availabilityNote: "Limited edition",
      images,
      tags: buildTags(i),
      dimension: { h: height, w: width, d: depth, unit: "in" },
      weight: `${randomBetween(3, 14)} lbs`,
      shipping: [{ title: "Shipped within 7 working days in a box" }],
      stats: { worksSold: 0, buyers: 0 },
      metrics: {
        views: randomBetween(20, 250),
        likes: randomBetween(1, 40),
        shares: randomBetween(0, 8),
      },
      popularityScore: i % 3 === 0 ? randomBetween(5, 40) : 0,
      status: "for_sale",
      folder: "Unsorted",
      createdAt,
    });
  }

  console.log(`🎉 Seeded ${count} artworks for ${authorName} (${authorId})`);
};

async function seedArtwork() {
  const seedOnly = parseBoolean(process.env.SEED_ONLY);
  const hasBulk = Boolean(process.env.SEED_AUTHOR_ID);

  if (!seedOnly) {
    await seedDefaultArtworks();
  }

  if (hasBulk) {
    await seedBulkForAuthor();
  } else if (seedOnly) {
    console.warn("⚠️  SEED_ONLY=true but SEED_AUTHOR_ID is missing.");
  }
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

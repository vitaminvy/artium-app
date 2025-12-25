import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";

export type SeededUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isArtist: boolean;
};

export const seedUsers = async (db: admin.firestore.Firestore, count: number = 100): Promise<SeededUser[]> => {
  console.log(`\n🌱 Seeding ${count} Users...`);
  const users: SeededUser[] = [];
  const auth = admin.auth();
  const batch = db.batch();

  // 1. Create Users in Auth & Firestore
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const displayName = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const photoURL = faker.image.avatar();
    const uid = `user-${i + 1}-${faker.string.alphanumeric(5)}`;

    // Create Auth User (Admin SDK skips password requirement mostly, but good to have)
    try {
      await auth.createUser({
        uid,
        email,
        displayName,
        photoURL,
        password: "password123", // Default password for testing
      });
    } catch (e: any) {
      if (e.code === 'auth/uid-already-exists' || e.code === 'auth/email-already-exists') {
        // Ignore if exists (idempotency)
      } else {
        console.error(`Failed to create auth user ${email}:`, e);
      }
    }

    // Prepare Firestore Data
    const userRef = db.collection("users").doc(uid);
    batch.set(userRef, {
      uid,
      username: faker.internet.username({ firstName, lastName }).toLowerCase(),
      displayName,
      email,
      photoURL,
      bio: faker.person.bio(),
      roles: { isArtist: false, isAdmin: false }, // Default
      stats: { followers: 0, following: 0, artworks: 0, sold: 0 },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    users.push({ uid, email, displayName, photoURL, isArtist: false });

    // Commit batch every 500 ops (Firestore limit)
    if ((i + 1) % 400 === 0) {
      await batch.commit();
      console.log(`   Saved ${i + 1} users to Firestore...`);
    }
  }

  await batch.commit();
  console.log(`✅ Created ${users.length} users.`);
  return users;
};

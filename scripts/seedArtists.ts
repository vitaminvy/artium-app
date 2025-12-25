import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { SeededUser } from "./seedUsers";

export const seedArtists = async (
  db: admin.firestore.Firestore,
  users: SeededUser[],
  targetCount: number = 40
): Promise<SeededUser[]> => {
  console.log(`\n🌱 Promoting ${targetCount} users to Artists...`);
  
  // Randomly shuffle users and pick top 40
  const shuffled = faker.helpers.shuffle(users);
  const selectedArtists = shuffled.slice(0, targetCount);

  const batch = db.batch();

  for (const artist of selectedArtists) {
    artist.isArtist = true; // Update local object

    // 1. Update User Role
    const userRef = db.collection("users").doc(artist.uid);
    batch.update(userRef, {
      "roles.isArtist": true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Create Artist Profile (Explicitly requested)
    const artistRef = db.collection("artists").doc(artist.uid);
    batch.set(artistRef, {
      id: artist.uid,
      name: artist.displayName,
      avatar: artist.photoURL,
      bio: faker.lorem.paragraph(),
      verified: faker.datatype.boolean(),
      origin: faker.location.city() + ", " + faker.location.country(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Promoted ${selectedArtists.length} artists.`);
  return selectedArtists;
};

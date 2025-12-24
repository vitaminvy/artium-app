import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { SeededUser } from "./seedUsers";
import { uploadRandomImage } from "./uploadToStorage";

export const seedArtworks = async (
  db: admin.firestore.Firestore,
  artists: SeededUser[],
  artworksPerArtist: number = 30
) => {
  console.log(`\n🌱 Seeding Artworks (~${artworksPerArtist}/artist)...`);
  
  // Process in chunks to avoid overwhelming Storage/Firestore
  // We process artists one by one to keep logs readable
  for (const [index, artist] of artists.entries()) {
    console.log(`   Processing artist ${index + 1}/${artists.length}: ${artist.displayName}`);
    
    const batch = db.batch();
    
    for (let i = 0; i < artworksPerArtist; i++) {
      // 1. Get Real Images from Storage (cached/uploaded)
      const numImages = faker.number.int({ min: 1, max: 3 });
      const images: string[] = [];
      for (let j = 0; j < numImages; j++) {
        const url = await uploadRandomImage("artworks");
        images.push(url);
      }

      const artworkId = faker.string.uuid();
      const price = faker.commerce.price({ min: 100, max: 5000 });
      const artworkRef = db.collection("artworks").doc(artworkId);

      batch.set(artworkRef, {
        id: artworkId,
        artistId: artist.uid,
        artistSnapshot: {
          name: artist.displayName,
          avatar: artist.photoURL,
          verified: true
        },
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: { 
            amount: Number(price), 
            currency: "USD"
        },
        images: images, 
        status: faker.helpers.arrayElement(["for_sale", "for_sale", "for_sale", "sold"]), // Mostly for sale
        materials: faker.commerce.productMaterial(),
        year: faker.date.past().getFullYear(),
        dimension: {
          height: faker.number.int({ min: 10, max: 100 }),
          width: faker.number.int({ min: 10, max: 100 }),
          depth: faker.number.int({ min: 1, max: 10 }),
          unit: "in"
        },
        weight: {
            value: faker.number.int({ min: 2, max: 20 }),
            unit: "lbs"
        },
        tags: [faker.word.adjective(), faker.word.noun(), "Art"],
        metrics: {
          likes: faker.number.int({ min: 0, max: 100 }),
          views: faker.number.int({ min: 100, max: 1000 }),
          saves: faker.number.int({ min: 0, max: 50 })
        },
        createdAt: admin.firestore.Timestamp.fromDate(faker.date.past()),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  }

  console.log("✅ Artworks seeded.");
};

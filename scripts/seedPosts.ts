import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { SeededUser } from "./seedUsers";
import { uploadRandomImage } from "./uploadToStorage";

export const seedPosts = async (
  db: admin.firestore.Firestore,
  users: SeededUser[],
  postsPerUser: number = 10
) => {
  console.log(`\n🌱 Seeding Posts (~${postsPerUser}/user)...`);

  // Use a global batch if total operations < 500, else chunk it.
  // Since 100 users * 10 posts = 1000 writes, we need to batch per user or per chunk.
  
  for (const [index, user] of users.entries()) {
    const batch = db.batch();
    
    for (let i = 0; i < postsPerUser; i++) {
        // 50% chance of having an image
        const hasImage = faker.datatype.boolean();
        let media = undefined;
        
        if (hasImage) {
            const url = await uploadRandomImage("posts");
            media = {
                type: "image",
                items: [{ uri: url, width: 800, height: 800 }]
            };
        }

        const postRef = db.collection("posts").doc();
        batch.set(postRef, {
            authorId: user.uid,
            authorSnapshot: {
                id: user.uid,
                name: user.displayName,
                handle: user.email.split("@")[0],
                avatar: user.photoURL
            },
            content: faker.lorem.sentences(2),
            media: media || null,
            metrics: {
                likes: faker.number.int({ min: 0, max: 200 }),
                comments: faker.number.int({ min: 0, max: 50 }),
                shares: faker.number.int({ min: 0, max: 20 })
            },
            createdAt: admin.firestore.Timestamp.fromDate(faker.date.recent()),
        });
    }
    
    await batch.commit();
    if ((index + 1) % 10 === 0) {
        console.log(`   Seeded posts for ${index + 1} users...`);
    }
  }

  console.log("✅ Posts seeded.");
};

import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { SeededUser } from "./seedUsers";
import { uploadRandomImage } from "./uploadToStorage";

export const seedEvents = async (
  db: admin.firestore.Firestore,
  users: SeededUser[],
  eventsPerUser: number = 10
) => {
  console.log(`\n🌱 Seeding Events (~${eventsPerUser}/user)...`);

  const batch = db.batch(); // Use a single batch for all events for efficiency

  for (const [userIndex, user] of users.entries()) {
    for (let i = 0; i < eventsPerUser; i++) {
      const eventId = faker.string.uuid();
      const eventRef = db.collection("events").doc(eventId);

      const startDate = faker.date.soon({ days: 30 });
      const endDate = faker.date.soon({ days: 7, refDate: startDate });

      const image = await uploadRandomImage("events");

      batch.set(eventRef, {
        id: eventId,
        organizerId: user.uid,
        organizerSnapshot: {
            id: user.uid,
            name: user.displayName,
            avatar: user.photoURL,
        },
        title: faker.lorem.words(faker.number.int({ min: 3, max: 7 })),
        description: faker.lorem.paragraph(faker.number.int({ min: 2, max: 5 })),
        location: {
            name: faker.location.streetAddress(true),
            address: faker.location.buildingNumber() + " " + faker.location.street(),
            city: faker.location.city(),
            state: faker.location.state(),
            country: faker.location.country(),
            coordinates: new admin.firestore.GeoPoint(faker.location.latitude(), faker.location.longitude()),
        },
        startDate: admin.firestore.Timestamp.fromDate(startDate),
        endDate: admin.firestore.Timestamp.fromDate(endDate),
        image,
        attendeeCount: faker.number.int({ min: 0, max: 500 }),
        isOnline: faker.datatype.boolean(0.3), // 30% chance of being online
        price: faker.helpers.arrayElement([
            { amount: 0, currency: "USD" },
            { amount: faker.number.int({ min: 10, max: 200 }), currency: "USD" },
        ]),
        tags: faker.helpers.arrayElements([
            "Exhibition", "Workshop", "Live Art", "Festival", "Online", "Meetup"
        ], faker.number.int({ min: 1, max: 3 })),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }
  
  await batch.commit();
  console.log(`✅ Seeded ${users.length * eventsPerUser} events.`);
};

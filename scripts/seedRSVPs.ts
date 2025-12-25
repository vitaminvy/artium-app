import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// 1. ENVIRONMENT & CONFIGURATION
dotenv.config(); // Load .env if needed for other vars

const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), "serviceAccount.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ ERROR: serviceAccount.json not found in project root.");
  console.error("   Please download it from Firebase Console -> Project Settings -> Service Accounts.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

// 2. FIREBASE ADMIN INITIALIZATION
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: Add storageBucket if needed, but not required for Firestore only
    // storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();

// 3. UTILITIES
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// 4. MAIN SEED FUNCTION
async function seedRSVPs() {
  console.log('🚀 STARTING ADMIN RSVP SEED...');
  console.log('   Mode: Manual RSVP generation based on existing Users & Events');

  try {
    // --- Step A: Fetch Users and Events ---
    console.log('⏳ Fetching ALL users and events...');
    
    const [usersSnap, eventsSnap] = await Promise.all([
      db.collection('users').get(),
      db.collection('events').get(),
    ]);

    if (usersSnap.empty) {
      console.log('❌ No users found in Firestore. Please seed users first.');
      return;
    }
    if (eventsSnap.empty) {
      console.log('❌ No events found in Firestore. Please seed events first.');
      return;
    }

    const userIds = usersSnap.docs.map(doc => doc.id);
    const eventIds = eventsSnap.docs.map(doc => doc.id);

    console.log(`✅ Found ${userIds.length} users and ${eventIds.length} events.`);

    // --- Step B: Prepare Writes ---
    let totalRsvps = 0;
    const batchSize = 400; // Firestore batch limit is 500
    let batches: FirebaseFirestore.WriteBatch[] = [db.batch()];
    let currentBatchIndex = 0;
    let opsInCurrentBatch = 0;

    const addOperation = (ref: FirebaseFirestore.DocumentReference, data: any) => {
      batches[currentBatchIndex].set(ref, data); // .set() with merge is safer, but default set is fine for new docs
      opsInCurrentBatch++;
      totalRsvps++;

      if (opsInCurrentBatch >= batchSize) {
        batches.push(db.batch());
        currentBatchIndex++;
        opsInCurrentBatch = 0;
      }
    };

    // --- Step C: Generate RSVP Logic ---
    console.log('⏳ Generating RSVPs...');
    
    for (const eventId of eventIds) {
      // Shuffle users to pick random ones for this event
      const shuffledUsers = shuffleArray(userIds);

      // Determine counts
      const numGoing = getRandomInt(10, 30);
      const numMaybe = getRandomInt(5, 15);
      
      // Ensure we don't exceed total users
      const actualGoing = Math.min(numGoing, shuffledUsers.length);
      const actualMaybe = Math.min(numMaybe, shuffledUsers.length - actualGoing);

      const goingUsers = shuffledUsers.slice(0, actualGoing);
      const maybeUsers = shuffledUsers.slice(actualGoing, actualGoing + actualMaybe);

      const timestamp = admin.firestore.FieldValue.serverTimestamp();

      // Create 'going' RSVPs
      for (const uid of goingUsers) {
        // Schema: users/{uid}/event_rsvps/{eventId}
        const ref = db.collection('users').doc(uid).collection('event_rsvps').doc(eventId);
        addOperation(ref, {
          eventId: eventId,
          status: 'going',
          updatedAt: timestamp
        });
      }

      // Create 'maybe' RSVPs
      for (const uid of maybeUsers) {
        const ref = db.collection('users').doc(uid).collection('event_rsvps').doc(eventId);
        addOperation(ref, {
          eventId: eventId,
          status: 'maybe',
          updatedAt: timestamp
        });
      }
    }

    // --- Step D: Commit Batches ---
    console.log(`💾 Committing ${totalRsvps} RSVPs across ${batches.length} batches...`);
    
    for (let i = 0; i < batches.length; i++) {
        if (batches[i] === undefined) continue;
        // Check if batch is empty by checking if it's the last one and ops is 0 (though our logic handles this)
        // Admin SDK batches don't expose size easily, but our construction ensures populated batches except maybe last.
        // Just commit.
        try {
            await batches[i].commit();
            console.log(`   ✔ Batch ${i + 1}/${batches.length} committed.`);
        } catch (err) {
            console.error(`   ❌ Batch ${i + 1} failed:`, err);
        }
    }

    console.log('\n🎉 RSVP Seeding Complete!');
    console.log('------------------------------------------------');
    console.log('📊 Query Examples:');
    console.log('1. Count guests for an event:');
    console.log(`   db.collectionGroup('event_rsvps').where('eventId', '==', 'ID').where('status', '==', 'going').count()`);
    console.log('2. Get user\'s schedule:');
    console.log(`   db.collection('users').doc(uid).collection('event_rsvps').get()`);
    console.log('------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ SEED FAILED:', error);
    process.exit(1);
  }
}

seedRSVPs();
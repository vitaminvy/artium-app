const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();

const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), "serviceAccount.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("❌ ERROR: serviceAccount.json not found in project root.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const BATCH_LIMIT = 450;
const PAGE_SIZE = 200;

async function backfillInvoices() {
  console.log("🚀 Backfilling invoice status/isActive + sold artworks...");

  let lastDoc = null;
  let scanned = 0;
  let invoiceUpdates = 0;
  let artworkUpdates = 0;

  let batch = db.batch();
  let operations = 0;

  const flush = async () => {
    if (operations === 0) return;
    await batch.commit();
    batch = db.batch();
    operations = 0;
  };

  const queueUpdate = async (ref, data) => {
    if (!data || Object.keys(data).length === 0) return;
    batch.update(ref, data);
    operations += 1;
    if (operations >= BATCH_LIMIT) {
      await flush();
    }
  };

  while (true) {
    let query = db
      .collection("invoices")
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(PAGE_SIZE);

    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      scanned += 1;
      const data = doc.data() || {};
      const status = data.status;
      const paymentStatus = data.payment?.status;
      const isPaid = paymentStatus === "paid" || status === "paid";

      const updates = {};
      if (!status) {
        updates.status = "draft";
      }

      if (isPaid) {
        if (status !== "paid") {
          updates.status = "paid";
        }
        if (data.isActive !== false) {
          updates.isActive = false;
        }
        if (!data.paidAt) {
          updates.paidAt =
            data.payment?.paidAt || admin.firestore.FieldValue.serverTimestamp();
        }
      } else if (typeof data.isActive === "undefined") {
        updates.isActive = true;
      }

      if (Object.keys(updates).length > 0) {
        await queueUpdate(doc.ref, updates);
        invoiceUpdates += 1;
      }

      if (isPaid) {
        const artworkIds = new Set();
        if (data.artworkId) {
          artworkIds.add(String(data.artworkId));
        }
        if (Array.isArray(data.items)) {
          data.items.forEach((item) => {
            if (item?.artworkId) {
              artworkIds.add(String(item.artworkId));
            }
          });
        }

        for (const artworkId of artworkIds) {
          const artworkRef = db.collection("artworks").doc(artworkId);
          await queueUpdate(artworkRef, {
            status: "sold",
            isActive: false,
            soldAt: admin.firestore.FieldValue.serverTimestamp(),
            soldByInvoiceId: doc.id,
          });
          artworkUpdates += 1;
        }
      }

      if (scanned % 500 === 0) {
        console.log(
          `✅ Scanned ${scanned} invoices | updated ${invoiceUpdates} invoices | updated ${artworkUpdates} artworks...`
        );
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  }

  await flush();

  console.log(
    `🎉 Done. Scanned ${scanned} invoices | updated ${invoiceUpdates} invoices | updated ${artworkUpdates} artworks.`
  );
  process.exit(0);
}

backfillInvoices().catch((error) => {
  console.error("❌ Backfill failed:", error);
  process.exit(1);
});

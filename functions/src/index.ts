import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {defineSecret} from "firebase-functions/params";
import {createHmac} from "crypto";

const PAYOS_CLIENT_ID = defineSecret("PAYOS_CLIENT_ID");
const PAYOS_API_KEY = defineSecret("PAYOS_API_KEY");
const PAYOS_CHECKSUM_KEY = defineSecret("PAYOS_CHECKSUM_KEY");

admin.initializeApp();
const db = admin.firestore();

const PAYOS_ENDPOINT = "https://api-merchant.payos.vn/v2/payment-requests";

const buildPayosSignature = (payload: {
  amount: number;
  cancelUrl: string;
  description: string;
  orderCode: number;
  returnUrl: string;
}) => {
  const raw = [
    `amount=${payload.amount}`,
    `cancelUrl=${payload.cancelUrl}`,
    `description=${payload.description}`,
    `orderCode=${payload.orderCode}`,
    `returnUrl=${payload.returnUrl}`,
  ].join("&");
  return createHmac("sha256", PAYOS_CHECKSUM_KEY.value())
    .update(raw)
    .digest("hex");
};

type SignatureRequest = {
  get: (name: string) => string | undefined;
};

const getSignatureHeader = (req: SignatureRequest) => {
  return (
    req.get("x-payos-signature") ||
    req.get("x-signature") ||
    req.get("x-payOS-signature")
  );
};

const mapPayosStatus = (status?: string) => {
  const normalized = status?.toLowerCase();
  if (!normalized) return null;
  if (["paid", "success"].includes(normalized)) return "paid";
  if (["cancel", "canceled", "cancelled"].includes(normalized)) {
    return "canceled";
  }
  if (["failed", "error"].includes(normalized)) return "failed";
  return null;
};

const buildOrderCode = () => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 90) + 10;
  return Number(`${now}${random}`.slice(0, 15));
};

// Scheduled function to recalc popularity scores every hour
export const calculatePopularityScores = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
    const artworksRef = db.collection("artworks");
    const snapshot = await artworksRef.get();

    if (snapshot.empty) {
      console.log("No artworks found.");
      return null;
    }

    const batch = db.batch();

    snapshot.forEach((doc) => {
      const artwork = doc.data();
      const metrics = artwork.metrics || {likes: 0, views: 0};

      // Assumes you have a 'createdAt' Firestore Timestamp; fallback to now
      // to avoid NaN.
      const createdAt = artwork.createdAt?.toDate?.() || new Date();

      // --- Scoring Formula ---
      const points = (metrics.likes || 0) * 2 + (metrics.views || 0) * 0.5;
      const hoursSinceCreation =
        (Date.now() - createdAt.getTime()) / 3_600_000;
      const gravity = 1.8; // Gravity factor
      const score = points / Math.pow(hoursSinceCreation + 2, gravity);
      // -----------------------

      const artworkRefToUpdate = artworksRef.doc(doc.id);
      batch.update(artworkRefToUpdate, {popularityScore: score});
    });

    await batch.commit();
    console.log(`Updated popularity scores for ${snapshot.size} artworks.`);
    return null;
  });

export const createPayosPaymentLink = onCall(
  {
    secrets: [PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY],
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const invoiceId = request.data?.invoiceId as string | undefined;
    if (!invoiceId) {
      throw new HttpsError("invalid-argument", "invoiceId is required.");
    }

    const invoiceRef = db.collection("invoices").doc(invoiceId);
    const invoiceSnap = await invoiceRef.get();
    if (!invoiceSnap.exists) {
      throw new HttpsError("not-found", "Invoice not found.");
    }

    const invoice = invoiceSnap.data() as admin.firestore.DocumentData;
    if (invoice.sellerId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "Not allowed.");
    }

    if (invoice.payment?.status === "paid") {
      throw new HttpsError("failed-precondition", "Invoice already paid.");
    }

    if (invoice.payment?.checkoutUrl) {
      return {
        checkoutUrl: invoice.payment.checkoutUrl,
        orderCode: invoice.payment.orderCode,
        paymentLinkId: invoice.payment.paymentLinkId,
      };
    }

    const total = Number(invoice?.totals?.total ?? 0);
    if (!total || Number.isNaN(total) || total <= 0) {
      throw new HttpsError("invalid-argument", "Invalid invoice total.");
    }

    const orderCode = buildOrderCode();
    const description = `Invoice ${invoice.invoiceNumber || invoiceId}`;
    const returnUrl =
      process.env.PAYOS_RETURN_URL || "artium://payos/return";
    const cancelUrl =
      process.env.PAYOS_CANCEL_URL || "artium://payos/cancel";

    const payload = {
      orderCode,
      amount: Math.round(total),
      description,
      returnUrl,
      cancelUrl,
      signature: buildPayosSignature({
        amount: Math.round(total),
        cancelUrl,
        description,
        orderCode,
        returnUrl,
      }),
    };

    const response = await fetch(PAYOS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": PAYOS_CLIENT_ID.value(),
        "x-api-key": PAYOS_API_KEY.value(),
      },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as {
      data?: {
        checkoutUrl?: string;
        orderCode?: number;
        paymentLinkId?: string;
      };
    };
    if (!response.ok || !json.data?.checkoutUrl) {
      console.error("PayOS error:", json);
      throw new HttpsError("internal", "Failed to create payment link.");
    }

    const paymentData = json.data;

    await invoiceRef.update({
      payment: {
        provider: "payos",
        status: "pending",
        orderCode: paymentData.orderCode ?? orderCode,
        paymentLinkId: paymentData.paymentLinkId,
        checkoutUrl: paymentData.checkoutUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
    });

    return {
      checkoutUrl: paymentData.checkoutUrl,
      orderCode: paymentData.orderCode ?? orderCode,
      paymentLinkId: paymentData.paymentLinkId,
    };
  }
);

export const payosWebhook = onRequest(
  {
    secrets: [PAYOS_CHECKSUM_KEY],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signature = getSignatureHeader(req);
    if (!signature) {
      res.status(400).send("Missing signature");
      return;
    }

    const rawBody = req.rawBody?.toString("utf8") ?? JSON.stringify(req.body);
    const expected = createHmac("sha256", PAYOS_CHECKSUM_KEY.value())
      .update(rawBody)
      .digest("hex");

    if (signature !== expected) {
      res.status(401).send("Invalid signature");
      return;
    }

    const payload = req.body ?? {};
    const data = payload?.data ?? payload;
    const orderCode = data?.orderCode;
    const paymentLinkId = data?.paymentLinkId;
    const status = mapPayosStatus(data?.status);

    if (!orderCode && !paymentLinkId) {
      res.status(400).send("Missing orderCode");
      return;
    }

    const queryBase = db.collection("invoices");
    let query = queryBase
      .where("payment.orderCode", "==", orderCode)
      .limit(1);
    if (!orderCode) {
      query = queryBase
        .where("payment.paymentLinkId", "==", paymentLinkId)
        .limit(1);
    }
    const snapshot = await query.get();
    if (snapshot.empty) {
      res.status(404).send("Invoice not found");
      return;
    }

    const invoiceDoc = snapshot.docs[0];
    const update: Record<string, unknown> = {
      "payment.status": status ?? "pending",
      "payment.rawPayload": payload,
    };
    if (data?.paymentLinkId) {
      update["payment.paymentLinkId"] = data.paymentLinkId;
    }
    if (data?.transactionId) {
      update["payment.transactionId"] = data.transactionId;
    }
    if (status === "paid") {
      update["payment.paidAt"] = admin.firestore.FieldValue.serverTimestamp();
    }

    await invoiceDoc.ref.update(update);
    res.status(200).send("ok");
  }
);

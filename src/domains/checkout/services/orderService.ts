import { 
  doc, 
  runTransaction, 
  serverTimestamp, 
  Timestamp,
  collection
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import { AddressForm, DeliveryMethod } from "../types";
import { ArtworkDetail } from "../../artwork/types";

export type CreateOrderParams = {
  buyerId: string;
  artwork: ArtworkDetail;
  deliveryMethod: DeliveryMethod;
  shippingAddress: AddressForm;
  amount: {
    subtotal: number;
    shipping: number;
    total: number;
    currency: string;
  };
};

export type OrderResult = {
  success: boolean;
  orderId?: string;
  error?: string;
};

/**
 * Creates an order in Firestore using a Transaction.
 * Ensures the artwork is still 'for_sale' before processing.
 */
export const createOrder = async (params: CreateOrderParams): Promise<OrderResult> => {
  const { buyerId, artwork, deliveryMethod, shippingAddress, amount } = params;
  const artworkRef = doc(firestore, "artworks", artwork.id);
  // Auto-generate ID safely
  const newOrderRef = doc(collection(firestore, "orders"));

  try {
    await runTransaction(firestore, async (transaction) => {
      // 1. Read Artwork (Critical: Must be inside transaction)
      const artworkDoc = await transaction.get(artworkRef);
      if (!artworkDoc.exists()) {
        throw "Artwork does not exist.";
      }

      const artworkData = artworkDoc.data();
      if (artworkData.status !== "for_sale") {
        throw "Sorry, this artwork is no longer available.";
      }

      // 2. Create Order Document
      transaction.set(newOrderRef, {
        buyerId,
        sellerId: artworkData.artistId,
        artworkId: artwork.id,
        status: "pending", // Initial status
        deliveryMethod,
        shippingAddressSnapshot: shippingAddress,
        artworkSnapshot: {
          title: artwork.title,
          image: artwork.images?.[0] || "",
          priceAtPurchase: amount,
          artistName: artwork.artist.name,
        },
        price: amount,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3. Update Artwork Status to 'sold' (or 'hold')
      transaction.update(artworkRef, {
        status: "sold",
        updatedAt: serverTimestamp(),
        // Optional: Add buyerId to artwork if you want strict ownership tracking there
      });
      
      // 4. Update User Stats (Optional - can be done via Cloud Function to be safer)
      // We skip this here to keep transaction clean and fast.
    });

    return { success: true, orderId: newOrderRef.id };
  } catch (e: any) {
    console.error("Transaction failed: ", e);
    return { success: false, error: typeof e === "string" ? e : "Transaction failed" };
  }
};

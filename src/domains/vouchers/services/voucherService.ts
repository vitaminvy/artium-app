import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { firestore } from "@/configs/firebase";
import type { Voucher } from "../types";

const VOUCHERS_COLLECTION = "vouchers";

const toMillis = (value: unknown): number | undefined => {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof (value as any)?.toDate === "function") {
    return (value as any).toDate().getTime();
  }
  if (typeof value === "number") return value;
  return undefined;
};

const mapVoucher = (id: string, data: any): Voucher => ({
  id,
  code: data.code ?? "",
  type: data.type ?? "percentage",
  value: Number(data.value ?? 0),
  currency: data.currency,
  ownerId: data.ownerId ?? "",
  source: data.source ?? "manual",
  status: data.status ?? "active",
  minOrderAmount: data.minOrderAmount,
  maxDiscountAmount: data.maxDiscountAmount,
  auctionId: data.auctionId,
  invoiceId: data.invoiceId,
  issuedAt: toMillis(data.issuedAt),
  expiresAt: toMillis(data.expiresAt),
  usedAt: toMillis(data.usedAt),
  usedInvoiceId: data.usedInvoiceId,
});

export const subscribeToUserVouchers = (
  ownerId: string,
  onUpdate: (vouchers: Voucher[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(
    collection(firestore, VOUCHERS_COLLECTION),
    where("ownerId", "==", ownerId),
    where("status", "==", "active"),
    orderBy("expiresAt", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      onUpdate(snapshot.docs.map((docSnap) =>
        mapVoucher(docSnap.id, docSnap.data())
      ));
    },
    (error) => {
      console.error("Failed to subscribe to vouchers:", error);
      onError?.(error);
    }
  );
};

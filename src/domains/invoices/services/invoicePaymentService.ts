import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { firestore } from "@/configs/firebase";

const INVOICES_COLLECTION = "invoices";

export const getInvoiceIdByOrderCode = async (
  orderCode: string | number
): Promise<string | null> => {
  if (!orderCode) return null;

  const numeric =
    typeof orderCode === "string" && orderCode.trim()
      ? Number(orderCode)
      : orderCode;

  const values = Number.isNaN(Number(numeric))
    ? [orderCode]
    : [numeric, orderCode];

  for (const value of values) {
    const q = query(
      collection(firestore, INVOICES_COLLECTION),
      where("payment.orderCode", "==", value),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }
  }

  return null;
};

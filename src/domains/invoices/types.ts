export type InvoiceStatus = "draft" | "sent";

export type SellerSnapshot = {
  uid: string;
  displayName?: string;
  photoURL?: string;
};

export type InvoiceBuyer = {
  name?: string;
  email: string;
  message?: string;
};

export type InvoiceItem = {
  type: "artwork" | "custom";
  title: string;
  quantity: number;
  unitPrice: number;
  artworkId?: string;
  image?: string;
};

export type InvoiceTotals = {
  subtotal: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  total: number;
};

export type Invoice = {
  id: string;
  invoiceNumber?: string;
  status: InvoiceStatus;
  sellerId: string;
  sellerSnapshot: SellerSnapshot;
  buyer: InvoiceBuyer;
  items: InvoiceItem[];
  currency: string;
  totals: InvoiceTotals;
  createdAt?: number;
  updatedAt?: number;
  lastSentAt?: number;
  sentCount?: number;
};

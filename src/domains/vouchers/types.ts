export type VoucherType = "percentage" | "fixed";

export type VoucherSource =
  | "auction_participation"
  | "auction_winner"
  | "manual";

export type VoucherStatus =
  | "active"
  | "used"
  | "expired"
  | "cancelled";

export interface Voucher {
  id: string;
  code: string;
  type: VoucherType;
  value: number;
  currency?: "VND" | "USD";
  ownerId: string;
  source: VoucherSource;
  status: VoucherStatus;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  auctionId?: string;
  invoiceId?: string;
  issuedAt?: number;
  expiresAt?: number;
  usedAt?: number;
  usedInvoiceId?: string;
}

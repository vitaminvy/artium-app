# Auction MVP Plan

## 1. Pham vi MVP

Nen lam trong MVP:

- Dau gia co thoi gian: `startsAt`, `endsAt`, countdown realtime.
- Dat gia realtime.
- Nguoi cao nhat thang khi het gio.
- Tao invoice PayOS cho winner.
- Artwork chi `sold` sau khi winner thanh toan thanh cong.
- Timeline 3 giai doan: `sketch`, `color`, `final`.

De sau:

- Art Justice/dispute day du.
- Artist deposit/ky quy that.
- Escrow/giai ngan tung phan.
- Art Whisper nang cao. MVP chi can top bidder/winner co kenh trao doi ngan.
- Upload media rieng cho tung milestone neu khong kip MVP.

## 2. Schema Dang Dung

Da co auction model trong `src/domains/auction/type.ts`.

```ts
auctions/{auctionId}
  artworkId
  artistId
  status: "scheduled" | "live" | "ended" | "settled" | "cancelled"
  stage: "sketch" | "color" | "final"
  startsAt
  endsAt
  startingPrice
  currentBid
  minIncrement
  topBidderId
  bidCount
  currency
  winnerInvoiceId?

auctions/{auctionId}/bids/{bidId}
  bidderId
  amount
  createdAt
```

Artwork model trong `src/domains/artwork/types.ts` da co them:

```ts
saleMode?: "fixed" | "auction"
auctionId?: string
status?: "for_sale" | "on_auction" | "sold"
```

## 3. Backend Hien Tai

Da lam trong `functions/src/index.ts`:

- `createAuction`
  - Artist tao auction cho artwork cua minh.
  - Kiem tra artwork owner.
  - Khoa artwork sang `saleMode: "auction"` va `status: "on_auction"`.
  - Tao auction voi `stage: "sketch"`, `currentBid = startingPrice`, `bidCount = 0`.
- `placeBid`
  - Dat gia bang Firestore transaction.
  - Chan artist tu bid artwork cua minh.
  - Kiem tra auction chua ket thuc, da bat dau, va con nhan bid.
  - Kiem tra gia toi thieu `currentBid + minIncrement`.
  - Ghi bid vao subcollection.
  - Cap nhat `currentBid`, `topBidderId`, `bidCount`.
  - Gui notification `auction_outbid` cho bidder cu neu bi vuot gia.
- `closeExpiredAuctions`
  - Scheduled function chay moi 5 phut.
  - Query auction co `status in ["scheduled", "live"]` va `endsAt <= now`.
  - Neu co winner: set auction `status: "ended"`, ghi `endedAt`, gui notification `auction_ended` cho artist.
  - Neu khong co bid: set auction `status: "ended"` va tra artwork ve `saleMode: "fixed"`, `status: "for_sale"`.

Da co Firestore index cho scheduled query:

- `firestore.indexes.json`
- `firebase.json` da khai bao `"indexes": "firestore.indexes.json"`

Chua lam backend:

- `createWinnerInvoice` cho top bidder sau khi auction ket thuc.
- Noi invoice auction vao PayOS payment link hien co.
- PayOS paid -> auction `settled` -> artwork `sold`.
- Notification cho winner: thang phien va can thanh toan.
- Notification sap het gio.
- `updateAuctionStage` de artist chuyen `sketch -> color -> final`.

## 4. Firestore Rules

Da co trong `firestore.rules`:

- `auctions/{auctionId}` public read.
- `auctions/{auctionId}/bids/{bidId}` public read.
- Client khong duoc create/update/delete auction va bid truc tiep.
- Write auction/bid di qua Cloud Functions/Admin SDK de tranh gian lan gio, gia, top bidder.

## 5. Client Hien Tai

Da co domain service trong `src/domains/auction/services/auctionService.ts`:

- `getAuctionById`
- `getAuctionByArtworkId`
- `subscribeToAuction`
- `subscribeToArtworkAuction`
- `subscribeToAuctionBids`
- `createAuction`
- `placeBid`

Da co trong `ArtworkDetailScreen`:

- Subscribe auction realtime theo `artworkId`.
- Subscribe bid history realtime.
- Nut `Start auction` cho chu artwork.
- Modal tao auction: starting price, min increment, duration, currency.
- Auction panel:
  - Countdown/status.
  - Current bid.
  - Min increment.
  - Timeline 3 stage.
  - Bid history.
- Bid modal cho buyer.
- Disable bid khi:
  - Chua dang nhap.
  - Auction chua start.
  - Auction da end/settled/cancelled.
  - Current user la artist/owner.
- Primary action cua artwork detail doi theo auction:
  - `Start auction`
  - `Place bid`
  - `Scheduled`
  - `Ended`
  - `Your auction`

Da co trong `NotificationsScreen`:

- Icon cho `auction_outbid`.
- Icon cho `auction_ended`.
- Notification auction co `artworkId` se navigate qua `ArtworkDetail`.

Da co trong upload artwork:

- Upload flow hien van tao fixed-price artwork truoc.
- Nguoi ban co the vao artwork detail de `Start auction` sau.
- Nut `Submit` upload da co loading state `Submitting...` va disable trong luc submit.
- Alert upload failure hien message loi that tu Firebase.

## 6. Chua Lam O UI

- Upload/Edit chua co toggle `Fixed price / Auction` ngay luc dang artwork.
- Chua co UI winner xem/thanh toan auction invoice.
- Chua co state rieng cho auction ended without bids.
- Chua co UI artist chuyen stage `sketch -> color -> final`.
- Chua co upload milestone media cho tung stage.
- Discover/Home chua co badge/filter `Live Auction`.
- Artwork cards chua uu tien hien current bid.
- Chua co flow winner notification -> invoice/payment.

## 7. PayOS Va Invoice

PayOS invoice flow hien co san trong `functions/src/index.ts`, nhung chua gan voi auction.

Can them:

- Tao invoice type/source `auction`.
- Invoice co `auctionId`, `sellerId`, `buyerId`, artwork snapshot, amount = `auction.currentBid`.
- Ghi `winnerInvoiceId` vao auction.
- Winner bam notification hoac artwork detail de vao invoice/payment.
- Khi PayOS finalize paid:
  - Set invoice paid nhu flow hien tai.
  - Set auction `status: "settled"`.
  - Set artwork `status: "sold"`, `isActive: false`, `soldByInvoiceId`.

Ghi chu: auction het gio chi nen `ended`. Artwork chi nen `sold` khi invoice da thanh toan.

## 8. Ke Hoach Tiep Theo

### Buoc 1: Tao winner invoice

Them helper/function `createWinnerInvoice`.

Logic:

- Lay `auction.artworkId`, `auction.artistId`, `auction.topBidderId`, `auction.currentBid`, `auction.currency`.
- Lay artwork snapshot.
- Tao document `invoices/{invoiceId}`:
  - `sellerId = artistId`
  - `buyerId = topBidderId`
  - amount = `currentBid`
  - status = `sent` hoac `pending_payment`
  - source/type = `auction`
  - `auctionId`
- Ghi `winnerInvoiceId` vao auction.
- Gui notification cho winner: ban da thang phien, vui long thanh toan.

### Buoc 2: Goi winner invoice khi auction het gio

Cap nhat `closeExpiredAuctions`:

- Neu auction co winner:
  - Set `status: "ended"`.
  - Tao winner invoice.
  - Ghi `winnerInvoiceId`.
  - Gui notification cho artist va winner.
- Neu auction khong co bid:
  - Giu logic hien tai: ended va tra artwork ve fixed/for_sale.

### Buoc 3: Noi PayOS paid voi auction

Cap nhat flow finalize PayOS:

- Neu invoice la auction invoice:
  - Set auction `status: "settled"`.
  - Set artwork `status: "sold"`, `isActive: false`, `soldByInvoiceId`.
  - Co the ghi `settledAt`.

### Buoc 4: UI winner va ended auction

Cap nhat `ArtworkDetailScreen`:

- Neu auction `ended/settled`:
  - Hien trang thai ro rang.
- Neu current user la winner va co `winnerInvoiceId`:
  - Hien nut `Pay invoice` hoac `View invoice`.
- Neu auction ended ma khong co bid:
  - Hien `Auction ended without bids`.
- Neu user khong phai winner:
  - Khong hien bid button.

### Buoc 5: Artist quan ly stage

Them Cloud Function `updateAuctionStage`.

Logic:

- Chi `auction.artistId` moi duoc update.
- Stage chi duoc tien len:
  - `sketch -> color`
  - `color -> final`
- Cap nhat `updatedAt`.

UI:

- Trong `ArtworkDetailScreen`, neu current user la artist:
  - Hien nut `Advance stage`.
  - Hoac action trong options sheet.
- Timeline stage dang co san trong `AuctionPanel`, chi can noi action.

### Buoc 6: Badge va discover

Them badge cho artwork card:

- Neu `saleMode === "auction"` hoac `status === "on_auction"` thi hien `Live Auction`.
- Detail/Home/Discover nen uu tien hien current bid neu co auction.

Sau do moi them filter:

- Discover tab filter `Live Auction`.
- Home section `Live Auctions`.

### Buoc 7: Upload/Edit auction option

MVP hien tai co the de sau vi da co flow:

1. Artist upload artwork nhu binh thuong.
2. Vao detail.
3. Bam `Start auction`.

Neu muon dep hon thi them:

- Toggle `Fixed price / Auction` trong upload.
- Neu chon auction thi nhap:
  - Starting price.
  - Min increment.
  - Duration.
  - Currency.
- Sau khi tao artwork xong thi goi `createAuction`.

## 9. Thu Tu Nen Lam

1. `createWinnerInvoice`.
2. Goi `createWinnerInvoice` trong `closeExpiredAuctions`.
3. Noi PayOS paid -> auction `settled` -> artwork `sold`.
4. UI winner xem/thanh toan invoice.
5. `updateAuctionStage`.
6. Badge/filter `Live Auction`.
7. Upload/Edit auction option.

## Ghi Chu

- Stack hien tai da du realtime auction co ban: domain, service, rules, transaction backend, scheduled close, detail UI.
- Phan quan trong tiep theo la winner invoice PayOS, vi no bien auction ended thanh mot sale flow hoan chinh.

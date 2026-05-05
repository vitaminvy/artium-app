# Auction MVP Plan

## 1. Pham vi MVP

Nen lam truoc:

- Dau gia co thoi gian: `startsAt`, `endsAt`, countdown realtime.
- Dat gia realtime.
- Nguoi cao nhat thang khi het gio.
- Tao invoice PayOS cho winner.
- Timeline 3 giai doan nhu doc: phac thao, len mau, hoan thien.

De sau:

- Art Justice/dispute day du.
- Artist deposit/ky quy that.
- Escrow/giai ngan tung phan.
- Art Whisper nang cao. MVP chi can "top bidder duoc gop y ngan".

## 2. Schema Firestore Moi

Hien `ArtworkDetail` chi co `status?: "for_sale" | "sold"` trong `src/domains/artwork/types.ts`, nen can them auction model.

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

`artworks` nen co them:

```ts
saleMode: "fixed" | "auction"
auctionId?: string
status: "for_sale" | "on_auction" | "sold"
```

## 3. Backend Bat Buoc

Khong nen cho client tu update gia thang. Can Cloud Functions:

- `createAuction`: artist tao phien.
- `placeBid`: transaction kiem tra phien con live, gia cao hon `currentBid + minIncrement`, cap nhat top bidder.
- `closeExpiredAuctions`: scheduled function chot cac phien het gio.
- `createWinnerInvoice`: tao invoice cho nguoi thang.
- Notification: bi vuot gia, sap het gio, thang phien.

Hien functions da co PayOS invoice trong `functions/src/index.ts` va logic finalize thanh toan danh dau artwork sold, nen co the tai su dung.

## 4. Firestore Rules

Rules hien chi co `artworks`, `invoices`, `posts`, `chats`, chua co `auctions/bids`.

Can them:

- `auctions`: public read.
- `bids`: public/authenticated read tuy UI mong muon.
- Write bid nen di qua Cloud Function/Admin SDK de tranh gian lan gio, gia, top bidder.
- Artist chi duoc tao/cap nhat auction cua artwork minh so huu.

## 5. UI Can Them

Hien upload chi tao artwork fixed-price, detail chi co `Buy now`.

Can them:

- Upload/Edit: chon `Fixed price` hoac `Auction`, nhap gia khoi diem, buoc gia, thoi gian bat dau/ket thuc, 3 anh milestone.
- Artwork detail: neu la auction thi thay `Buy now` bang countdown + current bid + bid button.
- Bid sheet: nhap gia, validate min increment.
- Bid history.
- Artist view: nut chuyen giai doan, upload anh/video giai doan.
- Discover/Home: filter hoac badge `Live Auction`.

## 6. Timer

Hook `useReservationTimer` hien chi la timer local tren may.

Auction can dung `endsAt` tu server Firestore, client chi hien thi countdown. Quyen chot phien phai o Cloud Function.

## Ghi Chu

- File `doc/art-step-project.md` dang du artifact `</content>` va `<parameter ...>` o cuoi file, nen xoa cho sach.
- Stack hien tai du lam realtime auction. Thu can them la auction domain rieng + transaction backend + rules + UI flow.
- MVP dep nhat cho do an: live timed bidding + 3-stage timeline + winner invoice PayOS.

## 7. Tinh Trang Hien Tai

Da lam:

- Da co domain auction rieng trong `src/domains/auction`.
- Da co type `Auction`, `AuctionBid`, `AuctionStatus`, `AuctionStage`.
- Da co client service realtime:
  - Subscribe auction theo `auctionId`.
  - Subscribe auction theo `artworkId`.
  - Subscribe bid history.
  - Goi Cloud Function `createAuction`.
  - Goi Cloud Function `placeBid`.
- Da co Cloud Functions:
  - `createAuction`: artist tao auction, khoa artwork sang `saleMode: "auction"` va `status: "on_auction"`.
  - `placeBid`: dat gia bang Firestore transaction, cap nhat `currentBid`, `topBidderId`, `bidCount`.
- Da co Firestore rules cho `auctions/{auctionId}` va `auctions/{auctionId}/bids/{bidId}`:
  - Public read.
  - Client khong duoc create/update/delete truc tiep.
- `ArtworkDetailScreen` da co:
  - Nut `Start auction` cho chu artwork.
  - Countdown realtime.
  - Current bid.
  - Bid modal.
  - Bid history.
  - Disable bid khi chua start/da end/owner tu bid artwork cua minh.
- Artwork model da co them:
  - `saleMode?: "fixed" | "auction"`
  - `auctionId?: string`
  - `status?: "for_sale" | "on_auction" | "sold"`

Chua lam:

- Chua co scheduled function chot auction het gio.
- Chua tao invoice PayOS cho winner sau khi auction ket thuc.
- Chua co flow winner thanh toan auction.
- Chua co UI artist chuyen stage `sketch -> color -> final`.
- Chua co upload milestone media cho tung stage.
- Upload/Edit artwork van la fixed-price flow cu, chua chon auction luc dang bai.
- Discover/Home chua co badge/filter `Live Auction`.
- Chua co notification thang phien, sap het gio, winner can thanh toan.

## 8. Ke Hoach Tiep Theo

### Buoc 1: Chot auction het gio

Them scheduled Cloud Function `closeExpiredAuctions`.

Logic can co:

- Chay moi 1-5 phut.
- Query `auctions` co `status in ["scheduled", "live"]` va `endsAt <= now`.
- Neu auction co `topBidderId`:
  - Set `status: "ended"`.
  - Ghi `endedAt`.
  - Giu artwork o `status: "on_auction"` cho den khi winner thanh toan.
- Neu auction khong co bid:
  - Set `status: "ended"`.
  - Tra artwork ve `saleMode: "fixed"` va `status: "for_sale"` neu van muon ban tiep.
  - Hoac giu `on_auction` de artist tu quyet dinh relist. MVP nen tra ve `for_sale` cho de demo.

### Buoc 2: Tao invoice cho winner

Them helper/function `createWinnerInvoice`.

Logic can co:

- Lay `auction.artworkId`, `auction.artistId`, `auction.topBidderId`, `auction.currentBid`, `auction.currency`.
- Tao document `invoices/{invoiceId}` voi:
  - `sellerId = artistId`
  - `buyerId = topBidderId`
  - artwork snapshot
  - amount = `currentBid`
  - status = `sent` hoac `pending_payment`
  - source/type = `auction`
  - `auctionId`
- Ghi `winnerInvoiceId` vao auction.
- Gui notification cho winner: ban da thang phien, vui long thanh toan.
- Gui notification cho artist: auction da ket thuc va da co winner.

Ghi chu: artwork chi nen `sold` sau khi invoice PayOS thanh toan thanh cong. Khong danh dau sold ngay khi auction het gio.

### Buoc 3: Noi PayOS voi auction invoice

Tai su dung flow PayOS hien co trong `functions/src/index.ts`.

Can dam bao:

- Invoice auction co the tao payment link.
- Webhook PayOS khi paid se:
  - Set invoice `status: "paid"`.
  - Set auction `status: "settled"`.
  - Set artwork `status: "sold"`, `isActive: false`, `soldByInvoiceId`.

### Buoc 4: UI cho winner va ended auction

Cap nhat `ArtworkDetailScreen`:

- Neu auction `ended/settled`:
  - Hien trang thai `Ended` hoac `Settled`.
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

### Buoc 7: Upload/Edit flow

MVP co the de sau vi hien tai da co cach:

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

### Thu Tu Nen Lam

1. `closeExpiredAuctions`.
2. `createWinnerInvoice`.
3. Noi PayOS paid -> auction `settled` -> artwork `sold`.
4. UI winner xem/thanh toan invoice.
5. `updateAuctionStage`.
6. Badge/filter `Live Auction`.
7. Upload/Edit auction option.

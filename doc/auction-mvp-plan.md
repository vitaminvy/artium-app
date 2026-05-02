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

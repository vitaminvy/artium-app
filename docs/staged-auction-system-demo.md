# Staged Auction System

Commit/merge reference:

```txt
6743e4590235a6de0c3fe9e4943f1c71d420cf7d
```

Tài liệu này mô tả staged auction system đã được thêm vào Artium và cách demo end-to-end.

## 1. Tính năng đã thêm

### Auction theo stage

Auction có 3 stage:

```txt
sketch -> color -> final
```

Artist có thể tạo auction cho artwork của mình. Auction lưu các thông tin chính:

- `artworkId`
- `artistId`
- `status`
- `stage`
- `startsAt`
- `endsAt`
- `startingPrice`
- `currentBid`
- `minIncrement`
- `topBidderId`
- `bidCount`
- `currency`
- `winnerInvoiceId`

### Bidding qua Cloud Functions

Client không ghi trực tiếp vào:

```txt
auctions/{auctionId}
auctions/{auctionId}/bids/{bidId}
```

Buyer đặt bid qua Cloud Function để backend kiểm tra:

- user đã đăng nhập
- auction đang nhận bid
- bidder không phải artist của auction
- bid amount hợp lệ theo `currentBid + minIncrement`
- auction chưa ended/settled/cancelled

Khi bid hợp lệ:

- tạo bid document trong `auctions/{auctionId}/bids`
- update `currentBid`, `topBidderId`, `bidCount`
- gửi notification cho bidder cũ nếu bị outbid

### Artist stage control

Artist có thể advance auction stage theo thứ tự:

```txt
sketch -> color -> final
```

Stage update cũng đi qua Cloud Function, không cho client tự update Firestore.

### Auction close và winner invoice

Auction có thể kết thúc theo thời gian hoặc demo close.

Khi auction có winner:

- auction chuyển `ended`
- winner invoice được tạo trong `invoices`
- buyer/winner có thể mở invoice để thanh toán

Khi auction không có bid:

- auction kết thúc không có winner
- artwork được revert về trạng thái có thể bán fixed-price

### PayOS settlement

Payment settlement được xử lý qua backend:

- `finalizePayosPayment` verify trạng thái PayOS trước khi mark paid
- PayOS webhook vẫn xử lý settlement production path
- Khi invoice paid:
  - invoice chuyển `paid`
  - auction chuyển `settled`
  - artwork chuyển `sold`

### Demo controls

Thêm demo-only callables:

- `demoCloseAuction`
- `demoMarkAuctionInvoicePaid`

Các callable này chỉ chạy khi bật emulator/dev mode:

```txt
FUNCTIONS_EMULATOR=true
```

hoặc:

```txt
ARTIUM_DEMO_MODE=true
```

Client dev build có nút:

- `Close now (demo)` trong Artwork Detail cho artist
- `Mark paid demo` trong Invoice Detail cho auction invoice chưa paid

## 2. Chuẩn bị demo

### Cài dependencies

```bash
npm install
cd functions && npm install
```

### Build/lint Functions

```bash
cd functions
npm run build
npm run lint
cd ..
```

### Deploy Firestore rules/indexes nếu demo trên Firebase thật

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Deploy Functions nếu demo trên Firebase thật

```bash
firebase deploy --only functions
```

### Chạy app

```bash
npm start
```

## 3. Demo flow nhanh

### Account cần có

- Artist account: owner của artwork
- Buyer account: user khác artist

### Bước demo

1. Đăng nhập bằng artist.
2. Upload hoặc chọn một artwork chưa sold.
3. Mở Artwork Detail.
4. Bấm `Start auction`.
5. Nhập:
   - starting price
   - min increment
   - duration
   - currency
6. Tạo auction.
7. Kỳ vọng:
   - Artwork chuyển sang sale mode auction.
   - Auction panel hiển thị current bid, countdown, stage.
8. Đăng nhập bằng buyer.
9. Mở artwork đang auction.
10. Bấm `Place bid`.
11. Nhập bid amount hợp lệ.
12. Kỳ vọng:
    - Bid xuất hiện trong bid history.
    - `currentBid`, `topBidderId`, `bidCount` cập nhật realtime.
13. Quay lại artist.
14. Advance stage từ `sketch` sang `color`, rồi sang `final`.
15. Trong dev/demo mode, bấm `Close now (demo)`.
16. Kỳ vọng:
    - Auction chuyển `ended`.
    - Winner invoice được tạo.
17. Đăng nhập winner.
18. Mở winner invoice.
19. Thanh toán qua PayOS hoặc bấm `Mark paid demo`.
20. Kỳ vọng:
    - Invoice chuyển `paid`.
    - Auction chuyển `settled`.
    - Artwork chuyển `sold`.

## 4. Firestore cần kiểm tra

Auction:

```txt
auctions/{auctionId}
```

Bids:

```txt
auctions/{auctionId}/bids/{bidId}
```

Invoice:

```txt
invoices/{invoiceId}
```

Artwork:

```txt
artworks/{artworkId}
```

## 5. Expected status transitions

Auction có bid:

```txt
scheduled/live -> ended -> awaiting_payment -> settled
```

Auction không có bid:

```txt
scheduled/live -> ended
```

Invoice:

```txt
sent -> paid
```

Artwork:

```txt
for_sale -> on_auction -> sold
```

hoặc nếu auction không có bid:

```txt
on_auction -> for_sale
```

## 6. Security checks

Client không được ghi trực tiếp:

```txt
auctions/{auctionId}
auctions/{auctionId}/bids/{bidId}
```

Chỉ Cloud Functions/Admin SDK được mutate auction price, top bidder, stage, close/settlement state.

## 7. Notes

- Demo payment controls chỉ dành cho dev/emulator.
- Production payment nên đi qua PayOS verification/webhook.
- Feature này chưa bao gồm trust-based deposit, stage proof requirement, trust reward events, hoặc voucher rewards.

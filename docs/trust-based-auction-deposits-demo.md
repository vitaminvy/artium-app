# Trust-Based Auction Bid Deposits

Commit/merge reference:

```txt
7abc54087e05a02b9cc02d58fae7f7c9dc1481e4
```

Tài liệu này mô tả hệ thống bid deposit theo `trustScore` và cách demo flow đặt cọc auction.

## 1. Tính năng đã thêm

### Trust score gate cho bidding

User có `trustScore >= 80` được bid trực tiếp.

User có `trustScore < 80` phải trả deposit trước khi bid được accept.

Nếu user chưa có `trustScore`, backend mặc định là `100` để user cũ không bị block bất ngờ.

### Deposit policy

Deposit mặc định bằng 10% bid amount:

```txt
depositAmount = bidAmount * 10%
```

Deposit được lưu ở collection:

```txt
auctionDeposits/{depositId}
```

Deposit lifecycle:

```txt
pending -> paid -> applied
pending/paid -> refund_pending -> refunded
paid -> forfeited
```

### Prepare bid flow

Client gọi `prepareBid` trước khi bid.

Backend kiểm tra:

- auth
- auction hợp lệ
- bid amount hợp lệ
- user trust score

Nếu trust score cao:

- trả về `requiresDeposit: false`
- client gọi `placeBid`

Nếu trust score thấp:

- tạo deposit document
- tạo invoice riêng với `source/type: "auction_deposit"`
- tạo PayOS checkout link
- trả về checkout URL cho client

### Deposit payment auto-place bid

Khi deposit invoice được PayOS xác thực paid:

- invoice deposit chuyển `paid`
- deposit chuyển `paid`
- backend tự động gọi bid placement cho user
- bid chỉ được accept nếu deposit matching:
  - same auction
  - same bidder
  - same bid amount
  - deposit status `paid`

Flow này giúp user low-trust không thể tạo bid pending giả.

### Winner invoice deposit application

Nếu winner đã có paid deposit matching winning bid:

- winner invoice trừ deposit vào total
- deposit chuyển `applied` sau khi winner invoice paid

Invoice UI hiển thị:

- winning bid
- deposit applied
- remaining total

### Losing deposit refund pending

Khi winner invoice paid và auction settled:

- paid deposits của losing bidders chuyển `refund_pending`
- refund amount = deposit amount
- refund reason = `lost_auction`

Có demo callable:

```txt
demoMarkDepositRefunded
```

dùng để chuyển deposit từ `refund_pending` sang `refunded` trong demo/dev.

### Winner non-payment fallback

Nếu winner không thanh toán đúng hạn:

- auction ở `awaiting_payment`
- có `paymentDueAt`
- scheduled function xử lý invoice quá hạn
- current winner invoice bị cancel
- winner deposit có thể bị `forfeited`
- trust score winner bị giảm
- auction fallback sang bidder hợp lệ kế tiếp nếu có
- nếu không có bidder kế tiếp, paid deposits còn lại chuyển `refund_pending`

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

## 3. Test data cần chuẩn bị

Tối thiểu cần 3 account:

- Artist: owner của artwork
- High-trust buyer: `trustScore >= 80`
- Low-trust buyer: `trustScore < 80`

Có thể set trust score trực tiếp trong Firestore:

```txt
users/{highTrustUserId}.trustScore = 100
users/{lowTrustUserId}.trustScore = 50
```

Hoặc dùng script backfill nếu cần seed user cũ:

```bash
node scripts/backfillUserTrustScore.js
```

## 4. Demo high-trust bid

1. Artist tạo auction cho artwork.
2. Đăng nhập high-trust buyer.
3. Mở artwork đang auction.
4. Bấm `Place bid`.
5. Nhập bid amount hợp lệ.
6. Kỳ vọng:
   - Không hiện deposit modal.
   - Bid được accept trực tiếp.
   - `auctions/{auctionId}/bids/{bidId}` được tạo.
   - Auction `currentBid`, `topBidderId`, `bidCount` cập nhật.

## 5. Demo low-trust deposit bid

1. Đăng nhập low-trust buyer.
2. Mở artwork đang auction.
3. Bấm `Place bid`.
4. Nhập bid amount hợp lệ.
5. Kỳ vọng:
   - App hiển thị deposit modal.
   - Deposit amount khoảng 10% bid amount.
6. Tiếp tục thanh toán deposit qua PayOS checkout.
7. Sau PayOS return, app gọi payment finalization.
8. Kỳ vọng:
   - Deposit invoice chuyển `paid`.
   - `auctionDeposits/{depositId}` chuyển `paid`.
   - Bid được backend auto-place.
   - Bid xuất hiện trong bid history.

Firestore cần kiểm tra:

```txt
auctionDeposits/{depositId}
invoices/{depositInvoiceId}
auctions/{auctionId}/bids/{bidId}
```

## 6. Demo winner deposit applied

1. Cho low-trust buyer thắng auction bằng bid đã deposit.
2. Close auction để tạo winner invoice.
3. Mở winner invoice.
4. Kỳ vọng invoice hiển thị:
   - winning bid total
   - deposit applied
   - remaining amount
5. Winner thanh toán invoice.
6. Kỳ vọng:
   - Auction chuyển `settled`.
   - Artwork chuyển `sold`.
   - Winner deposit chuyển `applied`.
   - `appliedToInvoiceId` trỏ về winner invoice.

## 7. Demo losing deposit refund pending

1. Có ít nhất 2 low-trust bidders đã trả deposit và bid hợp lệ.
2. Một bidder thắng và thanh toán winner invoice.
3. Kỳ vọng:
   - Winner deposit chuyển `applied`.
   - Losing paid deposits chuyển `refund_pending`.
   - `refundReason = "lost_auction"`.
4. Trong demo/dev, gọi `demoMarkDepositRefunded`.
5. Kỳ vọng:
   - Losing deposit chuyển `refunded`.

## 8. Demo unpaid winner fallback

1. Cho auction có winner và winner invoice.
2. Để auction ở `awaiting_payment`.
3. Set hoặc chờ `paymentDueAt` quá hạn.
4. Chạy scheduled function xử lý overdue auction payments.
5. Kỳ vọng:
   - Current winner invoice bị cancel.
   - Current winner deposit chuyển `forfeited` nếu có.
   - Winner bị giảm trust score.
   - Auction fallback sang next eligible bidder nếu có.
   - New winner invoice được tạo cho bidder kế tiếp.

## 9. Firestore rules/security checks

Client chỉ được đọc deposit nếu:

- là bidder của deposit
- hoặc là artist của auction liên quan

Client không được create/update/delete:

```txt
auctionDeposits/{depositId}
```

Client cũng không được tự mutate:

```txt
auctions/{auctionId}
auctions/{auctionId}/bids/{bidId}
```

Các mutation nhạy cảm phải đi qua Cloud Functions/Admin SDK.

## 10. Expected status transitions

Deposit invoice:

```txt
sent -> paid
```

Deposit:

```txt
pending -> paid -> applied
```

hoặc losing bidder:

```txt
pending -> paid -> refund_pending -> refunded
```

hoặc unpaid winner:

```txt
pending -> paid -> forfeited
```

Auction:

```txt
live -> ended -> awaiting_payment -> settled
```

## 11. Notes

- Real refund qua PayOS chưa nằm trong scope feature này.
- `demoMarkDepositRefunded` chỉ đổi trạng thái Firestore để demo.
- Deposit không được apply cho non-auction-deposit invoice.
- Low-trust bid chỉ được accept sau khi deposit đã paid và backend auto-place bid thành công.

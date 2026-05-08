# Auction Proofs, Trust Rewards, and Voucher MVP

Tài liệu này tóm tắt 3 nhánh feature vừa được merge và cách demo luồng auction mới.

## 1. Các nhánh đã thêm gì?

### `feat/auction-stage-proofs`

Nhánh này thêm yêu cầu artist phải nộp proof cho từng stage của auction.

- Auction stages vẫn là `sketch`, `color`, `final`.
- Artist nộp proof qua callable `submitAuctionStageProof`.
- Proof được lưu ở:

```txt
auctions/{auctionId}/stageProofs/{stage}
```

- Client không được ghi trực tiếp proof document; mọi write đi qua Cloud Functions.
- Artist không thể advance:
  - từ `sketch` sang `color` nếu chưa có sketch proof
  - từ `color` sang `final` nếu chưa có color proof
- Auction ở final stage có bid/winner cần final proof trước khi close/finalize.
- `ArtworkDetailScreen` có UI để:
  - artist chọn ảnh proof, nhập note, submit proof
  - public/buyer xem proof đã submit theo từng stage
  - disable nút advance stage khi chưa có proof hiện tại

### `feat/auction-trust-rewards`

Nhánh này làm trust score có lịch sử và giải thích được.

- Thêm collection:

```txt
trustScoreEvents/{eventId}
```

- Trust score update qua helper idempotent `adjustTrustScoreOnce`.
- Trust score được clamp trong khoảng `0..100`.
- Thiếu `trustScore` thì mặc định là `100`.
- Bids được accept sẽ track participant tại:

```txt
auctions/{auctionId}/participants/{userId}
```

- Các reward/penalty:
  - Winner paid final invoice: `+5`
  - Winner unpaid / deposit forfeited: `-15`
  - Artist submits each stage proof: `+1`
  - Artist completes all 3 proofs: `+3`
  - Buyer participates across stages:
    - sketch -> color: `+1`
    - color -> final: `+1`
    - all 3 stages: `+2`

- Reward được idempotent theo user + auction + reason, nên chạy lại settlement hoặc submit lại proof không cộng trùng.

### `feat/auction-voucher-mvp`

Nhánh này thêm voucher reward sau khi auction settled.

- Thêm collection:

```txt
vouchers/{voucherId}
```

- Voucher chỉ được issue bởi Cloud Functions.
- User chỉ đọc được voucher của chính họ.
- Voucher chỉ issue sau khi winner invoice paid và auction settled.
- Winner nhận voucher:
  - source: `auction_winner`
  - code prefix: `AUCT-WINNER`
  - value: `3%`
  - expires after 30 days

- Losing participants nhận voucher:
  - source: `auction_participation`
  - code prefix: `AUCT-THANKS`
  - value: `5%`
  - max discount: `50000`
  - expires after 30 days

- Profile screen có section `My vouchers` để hiển thị voucher active.
- MVP này chưa apply voucher vào checkout/invoice total.

## 2. Chuẩn bị trước khi demo

### Cài dependencies

```bash
npm install
cd functions && npm install
```

### Build/lint backend

```bash
cd functions
npm run build
npm run lint
cd ..
```

### Deploy Firestore rules/indexes khi demo trên Firebase thật

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Deploy Functions khi demo trên Firebase thật

```bash
firebase deploy --only functions
```

### Chạy app

```bash
npm start
```

Sau đó mở app bằng Expo/dev client theo target bạn đang dùng.

## 3. Demo Stage Proofs

### Mục tiêu demo

Chứng minh artist không thể đi qua stage tiếp theo nếu chưa submit proof cho stage hiện tại.

### Các bước

1. Đăng nhập bằng tài khoản artist.
2. Mở một artwork thuộc artist đó.
3. Start auction cho artwork.
4. Auction bắt đầu ở stage `sketch`.
5. Trong auction panel, thử bấm `Advance to Color` khi chưa submit proof.
6. Kỳ vọng:
   - UI chặn action hoặc backend trả lỗi.
   - Message hiển thị: `Stage proof required before moving to the next stage.`
7. Chọn ảnh proof trong phần `Stage proof`.
8. Nhập note tùy chọn.
9. Bấm `Submit proof`.
10. Kỳ vọng:
    - Proof hiển thị trong stage `Sketch`.
    - Firestore có document `auctions/{auctionId}/stageProofs/sketch`.
11. Bấm `Advance to Color`.
12. Kỳ vọng:
    - Auction chuyển sang stage `color`.
13. Lặp lại với color proof để advance sang `final`.
14. Ở final stage, submit final proof trước khi close auction có bid.

### Firestore cần kiểm tra

```txt
auctions/{auctionId}
auctions/{auctionId}/stageProofs/sketch
auctions/{auctionId}/stageProofs/color
auctions/{auctionId}/stageProofs/final
```

## 4. Demo Trust Rewards

### Mục tiêu demo

Chứng minh trust score chỉ thay đổi khi có event hợp lệ và không bị cộng/trừ trùng.

### Buyer participation tracking

1. Đăng nhập bằng buyer A.
2. Bid ở stage `sketch`.
3. Artist submit sketch proof và advance sang `color`.
4. Buyer A bid tiếp ở stage `color`.
5. Kỳ vọng:
   - Firestore có participant doc:

```txt
auctions/{auctionId}/participants/{buyerAUserId}
```

   - `joinedStages.sketch = true`
   - `joinedStages.color = true`
   - Buyer A có trust event `buyer_continued_stage_participation` với delta `+1`.

6. Artist advance sang `final`.
7. Buyer A bid tiếp ở `final`.
8. Kỳ vọng:
   - `joinedStages.final = true`
   - Buyer A nhận thêm reward color -> final `+1`
   - Buyer A nhận all stages reward `+2`

### Artist proof rewards

1. Artist submit proof cho `sketch`, `color`, `final`.
2. Kỳ vọng:
   - Artist nhận `+1` cho mỗi stage proof.
   - Sau khi đủ 3 proof, artist nhận thêm `+3`.
3. Submit lại proof cùng stage.
4. Kỳ vọng:
   - Không có trust reward bị cộng trùng.

### Winner paid reward

1. Để auction kết thúc có winner.
2. Tạo hoặc mở winner invoice.
3. Buyer winner thanh toán invoice.
4. Gọi payment finalize hoặc dùng demo callable nếu đang ở demo mode.
5. Kỳ vọng:
   - Auction status chuyển `settled`.
   - Winner nhận trust event `auction_winner_paid` với delta `+5`.
   - Losing paid deposits chuyển `refund_pending` như flow cũ.

### Winner unpaid penalty

1. Cho auction vào trạng thái `awaiting_payment`.
2. Để `paymentDueAt` quá hạn hoặc dùng dữ liệu test để trigger scheduled function.
3. Chạy function xử lý overdue payment.
4. Kỳ vọng:
   - Winner chưa thanh toán nhận trust event `auction_winner_unpaid` với delta `-15`.
   - Deposit liên quan bị `forfeited` nếu có.
   - Không bị trừ trùng nếu function chạy lại.

### Firestore cần kiểm tra

```txt
trustScoreEvents/{eventId}
users/{userId}.trustScore
users/{userId}.auctionStats
auctions/{auctionId}/participants/{userId}
```

## 5. Demo Voucher MVP

### Mục tiêu demo

Chứng minh vouchers chỉ được issue sau khi auction settled và hiển thị trong Profile.

### Các bước

1. Tạo auction có ít nhất 2 buyer tham gia bid.
2. Đảm bảo có winner và ít nhất 1 losing participant.
3. Artist hoàn tất proof workflow.
4. Close auction.
5. Winner mở invoice và thanh toán.
6. Finalize payment để auction chuyển `settled`.
7. Kiểm tra Firestore:

```txt
vouchers/{voucherId}
```

8. Kỳ vọng:
   - Winner có voucher source `auction_winner`.
   - Losing participant có voucher source `auction_participation`.
   - Voucher status là `active`.
   - Voucher có `expiresAt`.
9. Đăng nhập bằng winner hoặc losing participant.
10. Mở Profile.
11. Kỳ vọng:
    - Section `My vouchers` hiển thị voucher active.

### Những gì chưa demo trong MVP

- Chưa apply voucher vào checkout.
- Chưa mark voucher `used`.
- Chưa issue voucher cho cancelled auction.

## 6. Security checks

Demo bằng client hoặc Firebase console rules simulator:

- Client không được create/update/delete:

```txt
auctions/{auctionId}
auctions/{auctionId}/bids/{bidId}
auctions/{auctionId}/stageProofs/{stage}
auctions/{auctionId}/participants/{userId}
auctionDeposits/{depositId}
trustScoreEvents/{eventId}
vouchers/{voucherId}
```

- Public/buyers đọc được stage proofs.
- User chỉ đọc được trust events của chính mình.
- User chỉ đọc được vouchers của chính mình.
- Artist đọc được participant docs của auction họ sở hữu.

## 7. Demo flow end-to-end đề xuất

1. Artist creates auction.
2. Artist cannot advance from `sketch` before proof.
3. Artist submits sketch proof.
4. Artist advances to `color`.
5. Buyer A bids in sketch and color.
6. Low-trust buyer follows deposit flow and only appears after deposit-paid auto bid.
7. Artist submits color proof and advances to `final`.
8. Artist submits final proof.
9. Auction closes with winner.
10. Winner pays final invoice.
11. Auction settles and artwork is marked sold.
12. Winner receives trust reward and winner voucher.
13. Artist receives proof workflow trust rewards.
14. Losing participants receive participation vouchers.
15. Losing paid deposits become `refund_pending`.

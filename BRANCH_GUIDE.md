# 🚀 Branch Guide: feat-update-hosting-events

## 📌 Tổng quan

Branch này đang implement **2 features chính** cho Events module:

1. ✅ **Fix RSVP Update Bug** trong Event Detail Screen (ĐÃ HOÀN THÀNH)
2. 🚧 **Cải tiến Events You're Hosting Logic** (CẦN DEPLOY FIREBASE RULES)

---

## 🎯 Feature 1: Fix RSVP Update Bug (HOÀN THÀNH ✅)

### **Vấn đề:**
- Khi user thay đổi RSVP (Going/Maybe) trong Event Detail Screen:
  - ❌ Guest count KHÔNG cập nhật ngay lập tức
  - ❌ KHÔNG có toast notification "Updated successfully"
  - ❌ Phải reload cả màn hình Events mới thấy Guest count update

### **Giải pháp đã implement:**

#### **1. Fix useEvents Hook** - `src/domains/events/hooks/useEvents.ts:312-330`
```typescript
// Trước: setRsvpStatus không trả về Promise
const setRsvpStatus = useCallback((id, status) => {
  setRsvpMap((prev) => ({ ...prev, [id]: status }));
  toggleEventRsvp(userId, id, status).catch(...); // Không await
}, []);

// Sau: Trả về Promise và await Firebase
const setRsvpStatus = useCallback(async (id, status) => {
  setRsvpMap((prev) => ({ ...prev, [id]: status }));
  await toggleEventRsvp(userId, id, status); // ✅ AWAIT
}, []);
```

#### **2. Update EventDetailScreen** - `src/screens/EventDetailScreen.tsx:144-200`
```typescript
const handleRsvpChange = async (status) => {
  // 1. ✅ Optimistic Update - Guest count tăng/giảm NGAY
  setGuestCounts((prev) => {
    // Giảm count của status cũ
    // Tăng count của status mới
  });

  // 2. ✅ Await Firebase update
  await params.onRsvpChange(status);

  // 3. ✅ Show toast notification
  showToast("Updated successfully");

  // 4. ✅ Fetch lại từ Firebase để verify
  const counts = await fetchEventGuestCounts(eventId);
  setGuestCounts(counts);
};
```

#### **3. Update EventScreen** - `src/screens/EventScreen.tsx:185-196`
```typescript
const handleRsvpChange = async (id, status) => {
  await setRsvpStatus(id, status); // ✅ AWAIT
  showToast("Updated successfully");
};
```

### **Kết quả:**
- ✅ Guest count update **NGAY LẬP TỨC** (optimistic update)
- ✅ Toast "Updated successfully" hiển thị sau khi Firebase confirm
- ✅ Không cần reload màn hình
- ✅ Auto revert nếu Firebase update fail

---

## 🎯 Feature 2: Cải tiến Events You're Hosting Logic (CẦN DEPLOY 🚧)

### **Vấn đề:**
- Events You're Hosting hiện tại có **RSVP button** → Không hợp lý
- Lý do: Bạn là **organizer** (người tổ chức) → luôn tham gia, không cần RSVP
- Thiếu chức năng **Delete Event** cho organizer

### **Giải pháp đã implement:**

#### **Module 1: HostingEventCard Component** ✅
**File:** `src/domains/discover/components/cards/HostingEventCard.tsx`

**Thay đổi:**
- ❌ Bỏ RSVP button (không hợp lý cho organizer)
- ✅ **Invite button** (full width) - Mở Email Modal để invite guests
- ✅ **Share button** - Share event to social platforms
- ✅ **Delete button** (màu đỏ) - Xóa event với confirmation

**UI Layout:**
```
┌─────────────────────────────────────┐
│  [    📧 Invite    ] [ 🔗 ] [ 🗑️ ]  │
│   (full width btn)   (icon) (icon)  │
└─────────────────────────────────────┘
```

#### **Module 2: Delete Event Service** ✅
**File:** `src/domains/discover/services/eventService.ts:429-456`

**Function:** `deleteEvent(eventId, organizerId)`

```typescript
export const deleteEvent = async (eventId: string, organizerId: string) => {
  // 1. Verify event exists
  const eventSnap = await getDoc(eventRef);

  // 2. Verify user is organizer (SECURITY CHECK)
  if (eventData.organizerId !== organizerId) {
    throw new Error("Only the event organizer can delete this event");
  }

  // 3. Delete from Firestore
  await deleteDoc(eventRef);
};
```

#### **Module 3: useEvents Hook** ✅
**File:** `src/domains/events/hooks/useEvents.ts:336-352`

**Function:** `deleteHostedEvent(eventId)`

```typescript
const deleteHostedEvent = async (eventId) => {
  // 1. Delete from Firebase
  await deleteEvent(eventId, currentUser.uid);

  // 2. Remove from local state
  setHostingItems((prev) => prev.filter((e) => e.id !== eventId));
  setDiscoverItems((prev) => prev.filter((e) => e.id !== eventId));
};
```

#### **Module 4: EventsHostingSection** ✅
**File:** `src/domains/events/components/sections/EventsHostingSection.tsx`

**Thay đổi:**
- ✅ Import `HostingEventCard` thay vì `EventCard`
- ✅ Bỏ props: `getRsvpStatus`, `onChangeRsvp`
- ✅ Thêm prop: `onDeleteEvent`

#### **Module 5: EventScreen** ✅
**File:** `src/screens/EventScreen.tsx:212-223`

**Thêm handler:**
```typescript
const handleDeleteEvent = async (eventId) => {
  try {
    await deleteHostedEvent(eventId);
    showToast("Event deleted successfully"); // ✅
  } catch (error) {
    showToast("Failed to delete event"); // ❌
  }
};
```

#### **Module 6: Firestore Rules** ✅ (CHỜ DEPLOY)
**File:** `firestore.rules:63`

**Đã update:**
```javascript
match /events/{eventId} {
  allow read: if true;
  allow create: if isSignedIn() && request.resource.data.organizerId == request.auth.uid;
  allow update: if isSignedIn() && resource.data.organizerId == request.auth.uid;

  // ✅ CHỖ NÀY ĐÃ SỬA - CHỜ DEPLOY
  allow delete: if isSignedIn() && resource.data.organizerId == request.auth.uid;
}
```

---

## ⚠️ CÔNG VIỆC CẦN HOÀN THÀNH

### 🔴 **BƯỚC QUAN TRỌNG: Deploy Firestore Rules**

**Vấn đề hiện tại:**
- Code đã hoàn thành ✅
- Firestore Rules đã update trong file `firestore.rules` ✅
- **NHƯNG** chưa deploy lên Firebase → Delete event bị lỗi **"Missing or insufficient permissions"**

**Cách deploy:**

#### **Option 1: Dùng Firebase CLI** (Khuyến nghị)

```bash
# 1. Di chuyển vào thư mục project
cd d:\UIT\Document_UIT\3th-Year\IE307\23521647\artium-app

# 2. Login Firebase (nếu chưa)
firebase login

# 3. Deploy Firestore Rules
firebase deploy --only firestore:rules

# 4. Đợi kết quả
# ✔  Deploy complete!
```

#### **Option 2: Dùng Firebase Console**

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: **artium-app** (hoặc tên project của bạn)
3. **Firestore Database** → **Rules** tab
4. Copy toàn bộ nội dung file `firestore.rules` và paste vào editor
5. Click **Publish**
6. Verify rule tại line 63:
   ```javascript
   allow delete: if isSignedIn() && resource.data.organizerId == request.auth.uid;
   ```

---

## 🧪 Testing Guide

### **Test Feature 1: RSVP Update** (ĐÃ HOÀN THÀNH)

1. Vào **Events Screen** → Click vào 1 event
2. Trong **Event Detail Screen**, thay đổi RSVP từ "None" → "Going"
3. **Expected Results:**
   - ✅ Guest count "Going" tăng lên NGAY LẬP TỨC (trong < 50ms)
   - ✅ Toast "Updated successfully" hiển thị sau ~150ms
   - ✅ Không cần reload màn hình
   - ✅ Refresh để verify: Guest count vẫn đúng

### **Test Feature 2: Delete Event** (SAU KHI DEPLOY RULES)

1. Vào **Events Screen** → Tab **Events You're Hosting**
2. Click nút **🗑️ Delete** trên 1 event
3. **Expected Results:**
   - ✅ Alert confirmation: "Are you sure you want to delete this event?"
   - ✅ Click "Delete" → Event biến mất khỏi danh sách ngay
   - ✅ Toast "Event deleted successfully" hiển thị
   - ✅ Reload app → Event vẫn không còn (confirm đã xóa trên Firebase)

### **Test Security:**

1. Thử delete event của **người khác**:
   - ❌ Lỗi: "Only the event organizer can delete this event"
   - ❌ Toast: "Failed to delete event"

---

## 📂 File Structure

```
src/
├── domains/
│   ├── discover/
│   │   ├── components/
│   │   │   └── cards/
│   │   │       ├── EventCard.tsx (unchanged)
│   │   │       └── HostingEventCard.tsx ✅ NEW
│   │   └── services/
│   │       └── eventService.ts ✅ MODIFIED
│   │           - Added: deleteEvent() function
│   │
│   └── events/
│       ├── components/
│       │   └── sections/
│       │       └── EventsHostingSection.tsx ✅ MODIFIED
│       │           - Uses HostingEventCard
│       │           - Removed RSVP props
│       │           - Added onDeleteEvent prop
│       │
│       └── hooks/
│           └── useEvents.ts ✅ MODIFIED
│               - setRsvpStatus: now async
│               - Added: deleteHostedEvent()
│
├── screens/
│   ├── EventDetailScreen.tsx ✅ MODIFIED
│   │   - Optimistic RSVP update
│   │   - Toast notification
│   │
│   └── EventScreen.tsx ✅ MODIFIED
│       - Async handleRsvpChange
│       - Added handleDeleteEvent
│
└── firestore.rules ✅ MODIFIED (CHỜ DEPLOY)
    - Line 63: allow delete for organizer
```

---

## 🔧 Troubleshooting

### **Lỗi: "firebase: command not found"**
```bash
npm install -g firebase-tools
firebase login
```

### **Lỗi: Delete event vẫn bị "Missing or insufficient permissions"**
- Nguyên nhân: Firestore Rules chưa được deploy
- Giải pháp: Chạy `firebase deploy --only firestore:rules`
- Verify: Check Firebase Console → Firestore → Rules tab

### **Lỗi: RSVP update chậm**
- Nguyên nhân: Network lag
- Kết quả: Optimistic update vẫn hiển thị ngay, chỉ có toast delay
- Acceptable: Toast delay ~150-300ms là bình thường

---

## 📊 Implementation Progress

| Module | Status | File |
|--------|--------|------|
| Fix RSVP Update Logic | ✅ DONE | `useEvents.ts`, `EventDetailScreen.tsx`, `EventScreen.tsx` |
| Create HostingEventCard | ✅ DONE | `HostingEventCard.tsx` |
| Delete Event Service | ✅ DONE | `eventService.ts` |
| Delete Event Hook | ✅ DONE | `useEvents.ts` |
| Update EventsHostingSection | ✅ DONE | `EventsHostingSection.tsx` |
| Update EventScreen Handler | ✅ DONE | `EventScreen.tsx` |
| **Deploy Firestore Rules** | 🚧 **PENDING** | `firestore.rules` |

---

## 🎯 Next Steps

### **Bước 1: Deploy Firestore Rules** (QUAN TRỌNG)
```bash
cd d:\UIT\Document_UIT\3th-Year\IE307\23521647\artium-app
firebase deploy --only firestore:rules
```

### **Bước 2: Test Delete Event**
- Vào Events You're Hosting
- Click Delete button
- Verify event bị xóa
- Check Firebase Console → Firestore → events collection

### **Bước 3: Test Edge Cases**
- Delete event của người khác → Phải lỗi
- Delete event đang offline → Phải show error toast
- Delete nhiều events liên tiếp → Không bị crash

### **Bước 4: (Optional) Clean up**
- Test toàn bộ flow RSVP update
- Test Email invite functionality
- Test Share functionality
- Verify không có memory leak (check toast cleanup)

---

## 📝 Git Commands

```bash
# Check current branch
git branch
# Output: * feat-update-hosting-events

# Check changed files
git status

# Commit nếu cần (SAU KHI DEPLOY RULES THÀNH CÔNG)
git add .
git commit -m "feat: Update hosting events logic and fix RSVP update bug

- Add HostingEventCard with Invite/Share/Delete buttons
- Implement delete event functionality with security checks
- Fix RSVP update with optimistic updates and toast notifications
- Update Firestore rules to allow organizer delete events"

# Push lên remote
git push origin feat-update-hosting-events
```

---

## 🆘 Support

Nếu gặp vấn đề:

1. **Lỗi Firebase permissions:**
   - Check file `firestore.rules` line 63
   - Verify đã deploy: `firebase deploy --only firestore:rules`
   - Check Firebase Console → Firestore → Rules

2. **Lỗi RSVP update:**
   - Check Network tab trong DevTools
   - Verify Firebase connection
   - Check console logs

3. **Lỗi Delete event:**
   - Verify user là organizer của event
   - Check Firebase Console → Firestore → events collection
   - Verify organizerId field

---

## 📚 Related Documentation

- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Optimistic Updates](https://react.dev/reference/react/useOptimistic)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Good luck!** 🚀

Nếu cần hỗ trợ, liên hệ qua Discord/Telegram.

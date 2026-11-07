# Notification Management

Feature quản lý việc soạn và gửi thông báo tới các nhóm người dùng trong Freshy Web Manager.

## Naming

Tên feature trong source:

```text
notification-management
```

Tên hiển thị trên UI:

```text
Hỗ trợ khách hàng
```

Route hiện tại:

```text
/customer-care
```

Route cũ được giữ nguyên để tránh ảnh hưởng navigation, bookmark và deep link hiện có.

---

# Status

```text
M13 — Notification Management
Frontend migration implemented
```

Progress:

```text
M13-B1  Audit hiện trạng                         DONE
M13-B2  Feature boundary + constants             DONE
M13-B3  API adapter + mutation hook              DONE
M13-B4  Page shell + create/send flow            DONE
M13-B5  Local history + toolbar + table          DONE
M13-B6  Detail + resend/delete UX                DONE
M13-B7  Route switch                             DONE
M13-B8  Legacy cleanup                           DONE
M13-B9  Final QA + README/docs                   DONE
```

Trước khi commit/tag phase là hoàn tất trên local machine, chạy:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'CustomerCare|NotifyForm|openFormNotify|setOpenFormNotify' \
  src

grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'scheduleNotification|repeatCycle|config\.sendToGroupUser' \
  src

grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  'sendToGroupUser' \
  src

npm run build
```

Kỳ vọng:

```text
CustomerCare / NotifyForm / openFormNotify
→ không còn runtime reference

scheduleNotification / repeatCycle / config.sendToGroupUser
→ không còn runtime reference

sendToGroupUser
→ chỉ còn transport và feature API consumer
```

---

# Feature responsibilities

Feature hiện chịu trách nhiệm cho:

```text
send notification immediately
audience selection
frontend validation
duplicate submit guard
send loading state

browser-local sent history
search local history
audience filter
sorting
pagination

notification detail
resend
delete local history record
```

Feature không giả lập các capability backend chưa hỗ trợ.

Không implement production scheduling bằng browser timer.

Không coi localStorage là authoritative notification history của hệ thống.

---

# Architecture

Target dependency:

```text
app
 ↓
features
 ↓
shared
```

Current send flow:

```text
NotificationManagementPage
        ↓
useNotificationManagement
        ↓
notification-management/api
        ↓
services/notification.js
        ↓
backend
```

Local history flow:

```text
API success
   ↓
useNotificationHistory
   ↓
localStorage
```

Điểm quan trọng:

```text
local history
≠
backend delivery history
```

---

# Folder structure

```text
src/features/notification-management/
├── api/
│   ├── index.js
│   └── notificationManagement.api.js
│
├── components/
│   ├── NotificationCreateModal/
│   ├── NotificationDetailModal/
│   ├── NotificationHistoryTable/
│   ├── NotificationHistoryToolbar/
│   └── index.js
│
├── constants/
│   ├── index.js
│   └── notificationConfig.js
│
├── hooks/
│   ├── index.js
│   ├── useNotificationHistory.js
│   └── useNotificationManagement.js
│
├── pages/
│   ├── NotificationManagementPage/
│   └── index.js
│
├── utils/
│   ├── index.js
│   └── notificationFormat.js
│
└── index.js
```

---

# Backend contract currently used

Frontend hiện chỉ dựa vào send contract đã có trong code:

```text
managerPhone
type
title
body
```

Feature API expose:

```text
sendNotificationNow({
  managerPhone,
  audience,
  title,
  body
})
```

Feature API map:

```text
audience
→ type
```

Không đưa các field scheduling vào request khi backend contract chưa được xác nhận.

---

# Audience source of truth

Audience mapping hiện tại:

```text
1 = Toàn bộ hệ thống
2 = Thực khách
3 = Đại lý
4 = Bếp
5 = Giao hàng
```

Source of truth frontend nằm tại:

```text
notification-management/constants
```

Không lặp magic value hoặc `switch(role)` ở nhiều component.

Default:

```text
1
```

Legacy bug:

```text
role: "all"
```

đã được loại bỏ.

Backend contract của các numeric value này vẫn cần được xác nhận và được ghi trong `PROJECT_BACKLOG.md`.

---

# Create notification

Flow:

```text
Tạo thông báo
        ↓
Chọn nhóm người nhận
        ↓
Nhập tiêu đề
        ↓
Nhập nội dung
        ↓
Gửi thông báo
        ↓
API success
        ↓
Ghi local history
```

Current create form chỉ chứa capability có contract thật:

```text
audience
title
body
```

Không migrate UI legacy:

```text
date
time
repeatCycle
browser scheduling
```

vì browser timer không phải persistent scheduler.

---

# Frontend validation

Hook chặn các request rõ ràng invalid:

```text
missing manager phone
invalid audience
empty title
empty body
```

Validation frontend không thay thế backend validation.

Mutation có duplicate-submit guard để giảm double-send khi user click nhanh nhiều lần.

---

# Send result semantics

Correct order:

```text
API success
→ append browser history
```

Không dùng:

```text
append history
→ gọi API
```

Nếu API fail:

```text
không tạo history record
```

Nếu API success nhưng localStorage fail:

```text
notification vẫn được xem là đã gửi
→ UI báo warning rằng local history không lưu được
```

Không báo sai rằng send request thất bại.

---

# Local browser history

History được lưu bằng key riêng của feature:

```text
freshy.notificationManagement.sentHistory.v1:<managerPhone>
```

History được scope theo manager để tránh trộn dữ liệu giữa các account trên cùng browser.

Feature không migrate key legacy:

```text
localStorage["notifications"]
```

Lý do: legacy code từng ghi record trước khi biết API có thành công hay không.

Dữ liệu cũ có thể chứa:

```text
successful send
failed send
scheduled item chưa chạy
recurring item không còn timer
```

Không có bằng chứng đủ để chuyển toàn bộ dữ liệu đó thành “đã gửi”.

---

# Local history record

Record hiện có:

```text
clientId
audience
title
body
sentAt
```

`clientId` chỉ là local identifier phục vụ:

```text
React row key
open detail
remove local record
```

Nó không phải backend/domain ID.

---

# sentAt semantics

`sentAt` được frontend tạo sau khi send API thành công:

```text
new Date().toISOString()
```

Nó có nghĩa:

> thời điểm browser nhận biết thao tác gửi đã thành công.

Nó không phải:

```text
backend delivery timestamp
recipient received timestamp
recipient read timestamp
```

Table hiển thị timestamp theo timezone local của thiết bị đang dùng.

---

# History toolbar

Toolbar hỗ trợ local search theo:

```text
title
body
audience label
```

UI luôn disclosure nguồn dữ liệu:

```text
Lịch sử trên trình duyệt này
```

để user không hiểu nhầm đây là notification history toàn hệ thống.

---

# History table

Columns:

```text
Tiêu đề
Người nhận
Nội dung
Đã gửi lúc
```

Table hỗ trợ:

```text
search
audience filter
title sorting
sent time sorting
frontend pagination
```

Không dùng cột STT.

Không đặt nhiều action button trên mỗi row.

Row là interaction chính:

```text
mouse click
Enter
Space
→ detail
```

---

# Detail modal

Detail hiển thị:

```text
audience
sentAt
title
full body
local-history disclosure
```

Actions:

```text
Gửi lại
Xóa khỏi lịch sử
```

Modal nhắc rõ:

```text
xóa local history
≠
thu hồi notification đã gửi
```

---

# Resend semantics

`Gửi lại` là một send event mới.

Ví dụ:

```text
10:00  Thông báo A
```

user resend lúc 14:30:

```text
14:30  Thông báo A
10:00  Thông báo A
```

Không sửa timestamp của record cũ.

Flow:

```text
sendNow()
→ API success
→ appendHistory()
→ new history record
```

---

# Delete semantics

Action:

```text
Xóa khỏi lịch sử
```

chỉ thực hiện:

```text
remove localStorage record
```

Không gọi backend delete.

Không thu hồi notification đã được gửi.

Không dùng wording:

```text
Xóa thông báo
```

vì wording đó dễ khiến user hiểu nhầm đây là server-side deletion.

---

# Scheduling

Legacy frontend từng dùng:

```text
date
time
repeatCycle
setInterval
```

Feature mới không migrate browser scheduler này.

Browser scheduler không đảm bảo chạy khi:

```text
tab đóng
browser đóng
device sleep
user logout
frontend reload
frontend deploy
```

Scheduling thật phải được backend/server scheduler xử lý.

Requirement được lưu trong:

```text
docs/PROJECT_BACKLOG.md
```

---

# Delivery analytics

Feature không hiển thị các metric như:

```text
đã nhận
đã đọc
thất bại theo recipient
tỷ lệ mở
```

vì current backend contract chưa cung cấp dữ liệu tương ứng.

Không derive hoặc invent các metric này từ local history.

---

# Route migration

Runtime route giữ nguyên:

```text
/customer-care
```

Route target mới:

```text
NotificationManagementPage
```

Public URL không đổi để tránh migration không cần thiết.

UI label vẫn là:

```text
Hỗ trợ khách hàng
```

Feature source được đặt theo nghiệp vụ thực tế hơn:

```text
notification-management
```

---

# Legacy cleanup

Legacy page được loại khỏi runtime:

```text
src/pages/CustomerCare/
```

Browser scheduling legacy cũng được loại bỏ cùng page.

Dead notification modal flow cũ được cleanup:

```text
src/components/Auth/NotifyForm.js
openFormNotify
setOpenFormNotify
```

Global service aggregator không còn cần expose:

```text
config.sendToGroupUser
```

Transport vẫn giữ:

```text
src/services/notification.js
```

vì feature API hiện sử dụng transport này.

---

# Shared components

Feature reuse shared infrastructure khi phù hợp:

```text
ManagementPageHeader
PrimaryActionButton
ManagementTable
ConfirmModal
AppToast
getErrorDescription
```

Business-specific components vẫn nằm trong feature:

```text
NotificationCreateModal
NotificationDetailModal
NotificationHistoryToolbar
NotificationHistoryTable
```

Rule:

> Shared is earned.

Không promote component chỉ vì dự đoán có thể tái sử dụng sau này.

---

# Deferred / backend work

Các concern sau không được giải quyết trong frontend migration:

```text
persistent notification scheduling
scheduling API contract
authoritative notification history API
stable notification identifier
audience contract confirmation
delivery/read status
```

Chi tiết nằm trong:

```text
docs/PROJECT_BACKLOG.md
```

---

# Final result

Migration direction:

```text
legacy monolithic CustomerCare
→ notification-management feature

browser scheduling
→ removed from production-facing feature

role magic values
→ centralized audience constants

history written before send
→ history only after API success

shared localStorage key
→ per-manager local history

row action clutter
→ row detail interaction

ambiguous delete
→ explicit local-history delete
```

Notification Management frontend migration hiện đã có đủ code và documentation cho M13.

Sau khi local grep/build pass, có thể commit phase này.

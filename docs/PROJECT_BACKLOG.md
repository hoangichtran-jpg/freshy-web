# Freshy Web — Project Backlog

Đây là source of truth cho những công việc đã phát hiện nhưng chưa xử lý trong phase hiện tại.

Mục tiêu:

- không làm mất technical debt;
- không làm mất backend/API requirements;
- không phá focus frontend hiện tại;
- không sửa nhiều layer cùng lúc;
- gom deferred work vào đúng phase sau.

---

# Status

```text
TODO
BLOCKED_BE
DEFERRED
NEEDS_REVIEW
DONE
```

## TODO

Công việc hợp lệ nhưng chưa thực hiện.

## BLOCKED_BE

Frontend requirement đã rõ nhưng cần backend/API hỗ trợ.

## DEFERRED

Cố ý để sang phase sau.

## NEEDS_REVIEW

Chưa đủ contract hoặc business context để quyết định.

## DONE

Đã hoàn thành.

---

# Current focus

```text
FRONTEND / UI / UX
```

Thứ tự ưu tiên hiện tại:

```text
1. Frontend architecture
2. UI / UX
3. Interaction consistency
4. Frontend correctness
5. Responsive
6. Legacy cleanup
7. Documentation
8. Backend / API
9. Data / runtime
10. Performance / realtime
```

Không chuyển sang backend/data/runtime trừ khi frontend bị block hoàn toàn.

---

# Completed frontend features

## Address Management

```text
DONE
```

Address Management frontend migration đã đóng.

Backend/data/runtime optimization vẫn để phase sau.

---

## Marketing

```text
DONE
```

Marketing frontend đã được chuyển về feature architecture và hoàn thiện management UI.

Các concern về ordering/persistence vẫn nằm trong backend backlog bên dưới.

---

## Service Quality

```text
M12 — CLOSED
```

Progress:

```text
M12-B1  Audit hiện trạng             DONE
M12-B2  Feature boundary             DONE
M12-B3  API adapter + data hook      DONE
M12-B4  Page shell + stats           DONE
M12-B5  Toolbar + table              DONE
M12-B6  Detail modal + image UX      DONE
M12-B7  Route switch                 DONE
M12-B8  Legacy cleanup               DONE
M12-B9  Final QA + documentation     DONE
```

Legacy frontend đã được loại khỏi runtime:

```text
src/pages/ManageRequestRate/
src/components/RequestRateList/
config.getRequestRate
```

Transport hiện tại vẫn còn:

```text
src/services/requestRate.js
```

và được feature API sử dụng trực tiếp.

---

## Notification Management

```text
M13 — FRONTEND MIGRATION IMPLEMENTED
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

Runtime target:

```text
/customer-care
→ NotificationManagementPage
→ useNotificationManagement
→ notification-management/api
→ services/notification.js
```

Local history:

```text
API success
→ browser-local history
```

History được disclosure rõ là dữ liệu trên trình duyệt hiện tại, không phải authoritative server history.

Legacy browser scheduling không được migrate sang feature mới.

---

# Marketing — Backend / API

## BLOCKED_BE — Verify banner sortOrder update

Cần xác nhận endpoint:

```text
PUT /banners/{id}
```

có thực sự hỗ trợ cập nhật:

```text
sortOrder
```

hay không.

Frontend không được coi generic update transport là bằng chứng chắc chắn cho backend contract.

---

## BLOCKED_BE — Batch banner reorder endpoint

Recommended contract:

```text
PUT /banners/reorder
```

Payload concept:

```json
{
  "items": [
    {
      "id": 12,
      "sortOrder": 0
    },
    {
      "id": 8,
      "sortOrder": 1
    }
  ]
}
```

Backend nên xử lý toàn bộ reorder trong một transaction.

---

## BLOCKED_BE — Banner reorder transaction

Expected:

```text
all updates succeed
→ commit

one update fails
→ rollback
```

Không để ordering ở trạng thái partial update.

---

## BLOCKED_BE — Banner visibility ordering semantics

Cần thống nhất khi:

```text
inactive
→ active
```

Recommended:

```text
append vào cuối active sequence
```

---

## BLOCKED_BE — Banner ordering normalization

Khi active banner bị:

```text
disable
delete
```

cần xác định backend có normalize persistent ordering hay không.

Visible order nên liên tục:

```text
1
2
3
4
```

---

## BLOCKED_BE — Banner create ordering

Long-term contract không nên bắt frontend hoặc manager quản lý raw:

```text
sortOrder
```

Preferred:

```text
create
→ backend append cuối active sequence
```

---

# Service Quality — Backend / API

## BLOCKED_BE — Stable review identifier

Frontend hiện xác nhận review data có:

```text
customerPhone
rateScore
rateNote
imagePaths
```

Chưa chứng minh có stable review identifier.

Backend nên expose identifier rõ ràng, ví dụ:

```text
id
```

hoặc domain-specific ID tương đương.

Frontend hiện chỉ tạo:

```text
clientKey
```

để React render list/table.

`clientKey` không được dùng cho mutation hoặc domain operation.

---

## BLOCKED_BE — Review created timestamp

Current contract chưa chứng minh có timestamp của review.

Nếu UI cần:

```text
sort theo ngày
filter theo ngày
đánh giá mới nhất
trend theo thời gian
SLA
```

backend cần expose timestamp phù hợp, ví dụ:

```text
createdAt
```

Tên field cuối cùng phải theo backend domain thực tế.

Frontend không tự tạo timestamp.

---

## BLOCKED_BE — Order / request context

Review hiện chưa có context rõ ràng về giao dịch tạo ra review.

Nếu manager cần truy vết:

```text
review
→ order
→ request
```

backend cần expose identifier tương ứng:

```text
orderId
requestId
```

Không suy luận giao dịch bằng `customerPhone`.

---

## BLOCKED_BE — POS / kitchen context

Frontend hiện chưa chứng minh response có:

```text
posId
posName
kitchenId
```

Nếu một manager quản lý nhiều trung tâm và cần phân tích chất lượng theo trung tâm, backend cần expose context này.

Sau khi có contract thật mới thêm:

```text
filter theo trung tâm
group metrics
quality breakdown
```

---

## NEEDS_REVIEW — Attention threshold

Frontend hiện tạm dùng:

```text
rateScore <= 2
```

để derive metric:

```text
Cần chú ý
```

Đây chưa phải business rule chính thức.

Cần xác nhận sau:

```text
1–2 sao
```

hay:

```text
1–3 sao
```

hoặc dựa trên:

```text
complaint type
severity
SLA
manual status
```

Không hard-code threshold này thành backend/domain rule trước khi business xác nhận.

---

## NEEDS_REVIEW — Service quality workflow

API hiện được audit chỉ chứng minh use case đọc review.

Chưa có evidence cho workflow:

```text
new
reviewing
resolved
ignored
assigned
replied
```

Không tự tạo workflow/status ở frontend.

Nếu Service Quality trở thành operational ticket system thì cần thiết kế domain/API riêng.

---

## DEFERRED — Server-side pagination and search

Endpoint hiện được frontend sử dụng như một array đầy đủ.

Nếu dataset tăng lớn, review:

```text
server pagination
server sorting
server filtering
server search
```

Frontend hiện chỉ search/filter trên dataset đã tải.

Không optimize sớm khi chưa có số liệu thực tế.

---

## DEFERRED — Aggregate analytics API

Frontend hiện derive:

```text
total
average score
low-score count
```

từ toàn bộ array được tải.

Điều này chỉ chính xác khi frontend đang có full dataset.

Nếu backend chuyển sang pagination thì frontend không được tính global analytics từ một page.

Khi đó backend cần trả:

```text
aggregate metadata
```

hoặc endpoint analytics riêng.

---

# Notification Management — Backend / API

## BLOCKED_BE — Persistent notification scheduling

Legacy frontend từng dùng browser `setInterval` để thực hiện notification lặp lại.

Cơ chế này không đảm bảo hoạt động khi:

```text
tab đóng
browser đóng
device sleep
user logout
frontend reload
frontend deploy
```

Recurring hoặc scheduled notification cần được thực thi bởi backend scheduler / job system.

Frontend chỉ nên quản lý:

```text
create schedule
edit schedule
cancel schedule
view schedule
```

Không dùng browser timer làm scheduling source of truth.

---

## BLOCKED_BE — Notification scheduling contract

Current backend transport chỉ chứng minh request:

```text
managerPhone
type
title
body
```

Chưa có backend contract được frontend xác nhận cho:

```text
sendAt
timezone
startAt
endAt
repeat interval
nextRunAt
schedule status
```

Legacy frontend có các field:

```text
date
time
repeatCycle
```

nhưng các field này không được gửi tới backend transport hiện tại.

Không đưa scheduling UI vào feature mới như một production capability cho tới khi backend contract tồn tại.

---

## BLOCKED_BE — Notification history API

Feature hiện chỉ có browser-local history sau khi send API thành công.

Local history không phải authoritative system delivery history.

Backend cần API history nếu product cần quản lý trạng thái như:

```text
sent
failed
scheduled
cancelled
```

Frontend không được coi localStorage là source of truth của notification history toàn hệ thống.

---

## BLOCKED_BE — Stable notification identifier

Nếu backend bổ sung notification history hoặc scheduling, mỗi notification cần stable identifier.

Stable ID cần cho:

```text
view detail
resend/reference
cancel schedule
archive/delete
status tracking
```

Local `clientId` hiện tại chỉ phục vụ browser history và không phải domain identifier.

---

## NEEDS_REVIEW — Notification audience contract

Current frontend mapping:

```text
1 = Toàn bộ hệ thống
2 = Thực khách
3 = Đại lý
4 = Bếp
5 = Giao hàng
```

Cần xác nhận đây là backend contract chính thức.

Feature hiện centralize các value này trong:

```text
notification-management/constants
```

để tránh magic values bị lặp khắp UI.

Long-term có thể chuyển sang enum/string contract rõ nghĩa nếu backend hỗ trợ.

---

## NEEDS_REVIEW — Notification delivery status

Endpoint gửi notification hiện chỉ chứng minh rằng frontend nhận response từ request gửi nhóm.

Chưa có contract được xác nhận cho delivery/read status theo recipient.

Không hiển thị hoặc suy luận các metric như:

```text
đã nhận
đã đọc
thất bại theo recipient
tỷ lệ mở
```

cho tới khi backend cung cấp dữ liệu tương ứng.

---

# Auth

## BLOCKED_BE — Move refresh token to HttpOnly cookie

### Problem

Backend hiện trả cả:

```text
access-token
refresh-token
```

trong response body.

Frontend vì vậy phải đọc refresh token và lưu bằng JavaScript, hiện tại thông qua:

```text
js-cookie
```

Ví dụ:

```js
Cookies.set(
  "refreshToken",
  refreshToken,
);
```

Cookie được tạo bởi JavaScript vẫn có thể bị JavaScript đọc lại.

Nếu application tồn tại XSS vulnerability, malicious JavaScript có thể truy cập refresh token.

Refresh token thường có lifetime dài hơn access token và có thể được dùng để xin access token mới, nên cần được bảo vệ tốt hơn.

---

### Target architecture

Login:

```text
POST /auth/authenticate
        ↓
Backend
        ├── response body
        │      └── access token
        │
        └── Set-Cookie
               └── refresh token
                   HttpOnly
                   Secure
                   SameSite
```

Frontend JavaScript chỉ nhận access token.

Frontend không đọc hoặc persist refresh token.

---

### Refresh flow

Target:

```text
access token expired
        ↓
frontend calls
POST /auth/refresh-token
        ↓
browser automatically sends
HttpOnly refresh cookie
        ↓
backend validates refresh token
        ↓
backend returns new access token
        ↓
frontend retries original request
```

Frontend không cần:

```text
getRefreshToken()
```

và không cần tự tạo:

```text
Authorization: Bearer <refresh-token>
```

cho refresh request.

---

### Backend requirements

Backend cần:

- set refresh token qua HTTP `Set-Cookie`;
- cookie có `HttpOnly`;
- production cookie có `Secure`;
- cấu hình `SameSite` phù hợp deployment;
- set cookie path phù hợp;
- refresh endpoint đọc refresh token từ cookie;
- không yêu cầu frontend gửi refresh token trong body hoặc `Authorization` header;
- login response không cần expose refresh token cho JavaScript;
- logout phải invalidate/revoke refresh token;
- logout phải clear refresh cookie;
- nên hỗ trợ refresh-token rotation;
- refresh token cũ sau rotation không nên tiếp tục sử dụng được.

Nếu frontend và backend chạy cross-origin:

- backend CORS phải cho phép credentials;
- allowed origin phải explicit;
- không dùng `Access-Control-Allow-Origin: *` cùng credentialed requests;
- frontend có thể cần `withCredentials: true`.

---

### Frontend changes after backend is ready

Sau khi backend contract mới được triển khai:

```text
remove js-cookie from refresh-token flow
```

Xóa:

```text
getRefreshToken()
Cookies.get("refreshToken")
Cookies.set("refreshToken", ...)
Cookies.remove("refreshToken", ...)
```

Refresh request chuyển từ:

```text
frontend reads refresh token
↓
frontend sends refresh token
```

sang:

```text
frontend calls refresh endpoint
↓
browser handles HttpOnly cookie
```

HTTP client chịu trách nhiệm:

```text
401
→ refresh once
→ receive new access token
→ retry failed request
```

Business features không được biết refresh-token implementation.

---

### Security goal

Target cuối:

```text
JavaScript
├── access token
└── user/session state

Browser + Backend
└── refresh token
    └── HttpOnly cookie
```

JavaScript không thể đọc refresh token.

Lưu ý:

`HttpOnly` giảm khả năng refresh token bị đánh cắp trực tiếp bởi JavaScript/XSS, nhưng không tự động loại bỏ toàn bộ rủi ro XSS.

Ứng dụng vẫn cần:

```text
XSS prevention
CSP
React escaping
dependency hygiene
safe DOM APIs
```

---

### Acceptance criteria

Backend integration chỉ được coi là hoàn thành khi:

- refresh token không xuất hiện trong `localStorage`;
- refresh token không xuất hiện trong `sessionStorage`;
- refresh token không xuất hiện trong frontend-readable cookie;
- refresh token không xuất hiện trong login response body;
- JavaScript không thể đọc refresh token;
- browser reload vẫn có thể restore authenticated session;
- access token hết hạn có thể refresh mà user không cần login lại;
- nhiều API cùng nhận `401` không tạo nhiều refresh request đồng thời;
- logout làm refresh token hiện tại không còn sử dụng được;
- expired/invalid refresh token đưa frontend về anonymous state;
- backend vẫn enforce authorization độc lập với frontend role checks.

---

### Migration note

Frontend auth refactor không cần block hoàn toàn bởi backend task này.

Migration strategy:

```text
Phase 1
centralize frontend session
+ centralize HTTP client
+ giữ compatibility với backend hiện tại

        ↓

Phase 2
backend implements HttpOnly refresh cookie

        ↓

Phase 3
frontend removes JS refresh-token handling
```

Mục tiêu của session abstraction là để khi backend contract thay đổi, phần lớn business feature không phải sửa.

---

## DEFERRED — Auth state source of truth

`AuthContext` hiện đọc:

```text
jwtToken
userInfo
```

từ:

```text
localStorage
```

Service Quality hiện lấy:

```text
userAuth.userPhone
```

từ auth context để gọi manager API.

Sau frontend phase cần review auth architecture để tránh:

```text
localStorage duplication
non-reactive auth data
manual JSON parsing
feature dependency vào storage shape
```

Target architecture:

```text
App / Features
      ↓
Auth / Session boundary
      ↓
storage implementation
```

Application code không nên phụ thuộc trực tiếp vào:

```text
localStorage key names
cookie names
JWT storage format
```

---

## DEFERRED — Access token persistence strategy

Hiện access token vẫn được persist trong:

```text
localStorage
```

để tương thích với frontend hiện tại.

Sau khi backend hỗ trợ HttpOnly refresh cookie, review target:

```text
access token
→ application memory

refresh token
→ HttpOnly cookie
```

Reload flow:

```text
browser reload
↓
access token memory mất
↓
frontend calls refresh endpoint
↓
browser sends HttpOnly refresh cookie
↓
backend returns new access token
↓
session reconstructed
```

Không migrate access token sang memory trước khi refresh contract backend đủ hỗ trợ restore session ổn định.

---

## DEFERRED — Centralized session boundary

Auth/session logic cần được centralize để business code không trực tiếp gọi:

```text
localStorage.getItem("jwtToken")
localStorage.setItem("jwtToken")
Cookies.get("refreshToken")
Cookies.set("refreshToken")
```

Target:

```text
UI / Feature
     ↓
AuthContext / Session API
     ↓
session persistence
```

Session boundary chịu trách nhiệm:

```text
read session
persist session
clear session
decode client-side claims
reactive session updates
```

Feature không được phụ thuộc vào storage implementation.

---

# API architecture

## DEFERRED — Transport migration

Feature API hiện được phép wrap:

```text
src/services/*
```

Target lâu dài:

```text
Feature
↓
Feature API
↓
shared HTTP client
↓
Backend
```

Không migrate toàn bộ transport trong UI phase.

---

## DEFERRED — Central HTTP client

Hiện nhiều API/service tự thực hiện:

```text
read access token
build Authorization header
handle request errors
```

Target:

```text
Feature API
      ↓
shared HTTP client
      ↓
request interceptor
      ↓
Authorization header
```

HTTP client nên là nơi duy nhất quản lý:

```text
base URL
access-token injection
401 handling
refresh coordination
request retry after refresh
common transport behavior
```

Business feature không nên biết access token được lưu ở đâu.

---

## DEFERRED — Concurrent refresh handling

Khi nhiều request đồng thời nhận:

```text
401 Unauthorized
```

không được tạo:

```text
request A → refresh
request B → refresh
request C → refresh
request D → refresh
```

Target:

```text
multiple 401 responses
        ↓
one shared refresh operation
        ↓
new access token
        ↓
retry waiting requests
```

Cần tránh:

```text
refresh storm
race condition
token overwrite
duplicate backend load
```

---

## DEFERRED — Standard API response contract

Sau frontend phase cần review:

```text
success response
error response
pagination response
validation errors
empty response
```

Mục tiêu là giảm việc mỗi feature tự parse một response shape khác nhau.

---

## DEFERRED — Error contract

Backend error nên có shape ổn định.

Concept:

```json
{
  "code": "RESOURCE_NOT_FOUND",
  "message": "Resource not found"
}
```

Frontend không nên phải parse nhiều kiểu error response khác nhau.

---

# Data / Runtime

## DEFERRED — Server-state architecture

Sau frontend phase mới review:

```text
TanStack Query / React Query
```

Concerns:

```text
cache
dedupe
stale time
background refresh
invalidations
mutation lifecycle
```

---

## DEFERRED — Optimistic mutations

Default an toàn hiện tại:

```text
request succeeds
→ patch local state
```

Chỉ dùng optimistic update khi UX thực sự cần:

```text
patch UI immediately
→ request
→ rollback on failure
```

---

## DEFERRED — Request cancellation

Review:

```text
AbortController
navigation cancellation
stale requests
upload cancellation
```

sau frontend phase.

Một số feature hiện đã có stale-request guard ở local hook, nhưng app-wide cancellation strategy chưa được chuẩn hóa.

---

## DEFERRED — Retry policy

Cần có rule chung:

```text
request nào retry
retry count
backoff
mutation retry
```

Không implement tùy ý ở từng feature.

---

# Images / Media

## DEFERRED — Image delivery strategy

Review:

```text
thumbnail generation
responsive images
WebP
AVIF
CDN
cache headers
image sizing
```

sau frontend phase.

Service Quality hiện dùng URL backend trả về và fallback image ở frontend.

---

# Realtime

## DEFERRED — Realtime architecture

Không đưa realtime vào UI refactor nếu feature chưa thật sự cần.

Sau frontend phase mới review:

```text
WebSocket
SSE
Pusher
polling
```

theo từng use case thật.

---

## TODO — Cross-browser order synchronization

Current Order UI có local state update sau khi một operator thực hiện action.

Tuy nhiên nhiều browser/device đang xem cùng POS có thể không nhận thay đổi ngay.

Observed behavior:

```text
Máy A
→ thay đổi order

Máy B
→ vẫn giữ state cũ
→ chỉ cập nhật sau một action/refetch khác
```

Target:

```text
Backend order change
        ↓
realtime event
        ↓
all connected clients
        ↓
refresh / patch affected order state
```

Preferred architecture:

```text
one realtime connection per browser/session
→ subscribe theo POS/kitchen/manager scope
```

Không quay lại architecture kiểu:

```text
one WebSocket connection per order
```

Frontend nên có fallback:

```text
WebSocket unavailable
→ polling / focus refresh
```

Backend contract cần được audit trước khi implementation.

---

# Performance

## DEFERRED — Profiling

Không optimize bằng cảm giác.

Sau frontend phase:

```text
React Profiler
network profiling
bundle analysis
render profiling
API latency
```

rồi mới quyết định optimization.

---

# Security

## TODO — Content Security Policy

Sau khi frontend architecture ổn định, thêm và test CSP phù hợp.

Review:

```text
script-src
style-src
img-src
font-src
connect-src
frame-src
object-src
base-uri
frame-ancestors
```

Cần tính tới:

```text
Firebase
API domain
WebSocket domain
external fonts/resources nếu còn
```

Không bật CSP strict trực tiếp trên production trước khi audit toàn bộ resource dependency.

---

## TODO — Security headers

Review Nginx / reverse proxy headers:

```text
Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security
```

`X-Frame-Options` hoặc CSP `frame-ancestors` tùy deployment strategy.

---

## TODO — Remove sensitive runtime logging

Không log:

```text
access token
refresh token
FCM token
authorization headers
password
sensitive user payload
```

Development logging cũng cần tránh credential data.

---

## TODO — Environment configuration audit

Không hard-code environment-specific endpoint/config nếu có thể đưa vào config/environment.

Review:

```text
API base URL
WebSocket URL
Firebase configuration
VAPID public key
runtime environment selection
```

Lưu ý:

Firebase web config và VAPID public key không phải private secret theo cùng nghĩa với service-account key hoặc password.

Tuy vậy chúng vẫn nên được quản lý như application configuration thay vì rải trong source.

---

## TODO — Upload security audit

Upload validation frontend chỉ là UX guard.

Backend vẫn phải validate:

```text
allowed MIME type
actual file signature / magic number
file size
filename handling
storage location
malware policy nếu cần
authorization
```

Không tin:

```text
extension
frontend MIME
frontend validation
```

làm security boundary.

---

## TODO — Rich text sanitization audit

Nếu application lưu/render HTML từ rich-text editor:

```text
Quill
editor HTML
user-generated rich text
```

cần audit toàn bộ render path.

Không render unsanitized HTML bằng:

```text
dangerouslySetInnerHTML
innerHTML
```

trừ khi content đã qua sanitizer/allow-list phù hợp.

---

# Shared frontend architecture

## TODO — Continue shared component audit

Rule:

> Shared is earned.

Chỉ promote component khi có reuse thực tế.

Không đưa component vào shared vì dự đoán có thể dùng sau này.

---

## TODO — Shared table filter primitives

Nếu nhiều feature thật sự lặp cùng filter UI mới cân nhắc:

```text
ManagementColumnFilter
createSelectColumnFilter
createDateColumnFilter
```

Không biến:

```text
ManagementTable
```

thành god component.

Business-specific filter vẫn nằm trong feature.

---

# Frontend consistency

## TODO — Management screen consistency

Các management feature tiếp tục thống nhất:

```text
page header
row interaction
filter language
empty state
loading state
error feedback
pagination
table spacing
action menu
status controls
```

Semantics khác nhau không cần ép giống nhau 100%.

---

## TODO — Responsive audit

Sau khi các management feature frontend hoàn tất:

```text
desktop
tablet
mobile
```

cần QA toàn app.

Không coi responsive của từng feature riêng lẻ là thay thế cho app-level audit.

---

# Documentation rule

Mỗi feature/refactor phase phải có documentation cập nhật trước khi đóng phase.

Trong quá trình implement có thể gom README update tới cuối feature để tránh sửa tài liệu lặp lại sau từng micro-step.

Khi phát hiện việc ngoài current phase:

```text
1. Ghi vào PROJECT_BACKLOG.md
2. Gắn status
3. Không nhảy phase
4. Tiếp tục frontend task
```

---

# Next backend phase

Chỉ bắt đầu sau khi frontend UI / UX phase được đóng:

```text
1. Review toàn bộ BLOCKED_BE
2. Review toàn bộ NEEDS_REVIEW
3. Gom API contract changes theo domain
4. Thiết kế migration
5. Implement backend
6. Update feature API adapters
7. Integration test
8. Data/runtime optimization
```

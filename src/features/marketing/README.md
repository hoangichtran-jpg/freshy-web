# Marketing / Advertising

Feature `marketing` quản lý toàn bộ giao diện và frontend flow liên quan đến quảng cáo/banner trong Freshy Web Manager.

```text
src/features/marketing/
```

Route:

```text
/marketing
```

Phase **UI / frontend refactor** của Marketing hiện đã hoàn thành.

---

# 1. Feature responsibilities

Marketing hiện chịu trách nhiệm cho:

```text
quản lý danh sách quảng cáo
tìm kiếm quảng cáo
lọc theo trạng thái
thống kê quảng cáo
xem preview banner
tạo quảng cáo mới
validate hình ảnh
compress hình ảnh
ẩn / hiện quảng cáo
xóa quảng cáo
```

Domain chính hiện tại của feature là:

```text
Advertising Banner
```

Marketing không phải một hệ thống campaign/ads platform đầy đủ.

Trong scope hiện tại:

```text
Marketing
=
Banner Management
```

---

# 2. Route

Route:

```text
/marketing
```

Entry page:

```text
MarketingPage
```

Router hiện import trực tiếp từ feature:

```text
routes
 ↓
features/marketing/MarketingPage
```

Không còn đi qua legacy page:

```text
src/pages/Marketing
```

---

# 3. Current structure

```text
src/features/marketing/
├── api/
│   ├── banners.api.js
│   └── index.js
│
├── components/
│   ├── BannerCreateModal/
│   │   ├── BannerCreateModal.scss
│   │   └── index.js
│   │
│   ├── BannerPreviewModal/
│   │   ├── BannerPreviewModal.scss
│   │   └── index.js
│   │
│   ├── BannerStats/
│   │   ├── BannerStats.scss
│   │   └── index.js
│   │
│   ├── BannerTable/
│   │   ├── BannerTable.scss
│   │   └── index.js
│   │
│   ├── BannerToolbar/
│   │   ├── BannerToolbar.scss
│   │   └── index.js
│   │
│   └── index.js
│
├── constants/
│   ├── bannerConfig.js
│   └── index.js
│
├── hooks/
│   ├── useBannerManagement.js
│   └── index.js
│
├── pages/
│   ├── MarketingPage/
│   │   ├── MarketingPage.scss
│   │   └── index.js
│   │
│   └── index.js
│
├── utils/
│   ├── bannerImage.js
│   └── index.js
│
├── index.js
└── README.md
```

---

# 4. Architecture

Dependency direction:

```text
app
 ↓
features/marketing
 ↓
shared
```

Không tạo dependency ngược:

```text
shared
 ↓
marketing
```

Data flow hiện tại:

```text
MarketingPage
      ↓
useBannerManagement
      ↓
features/marketing/api
      ↓
services/marketing
      ↓
backend
```

Presentation flow:

```text
MarketingPage
      ↓
Focused components
```

Architecture tổng quát:

```text
Page
 ↓
Hook
 ↓
Feature API
 ↓
Transport
```

---

# 5. Layer responsibilities

## `pages/`

Page chịu trách nhiệm orchestration.

`MarketingPage` hiện giữ các state có tính presentation như:

```text
searchText
statusFilter
isCreateOpen
previewBanner
confirmAction
```

Page quyết định:

```text
modal nào đang mở
toast nào cần hiển thị
confirm action nào đang chạy
search/filter nào đang active
```

Page không gọi transport/service trực tiếp.

---

## `hooks/`

Hook chịu trách nhiệm frontend data lifecycle.

Hook chính:

```text
useBannerManagement
```

Hook sở hữu:

```text
banners
loading
load error
creating state
processing banner state
fetch
refresh
create
toggle visibility
delete
request guards
```

---

## `api/`

Feature API cung cấp contract phù hợp với domain Marketing.

Ví dụ:

```js
createBanner({
  title,
  file,
  sortOrder,
});
```

thay vì để UI phụ thuộc vào transport signature kiểu:

```js
createBanner(
  title,
  file,
  sortOrder,
);
```

Feature API hiện đóng vai trò adapter quanh transport legacy.

---

## `components/`

Presentation và user interaction được tách thành các component nhỏ:

```text
BannerStats
BannerToolbar
BannerTable
BannerCreateModal
BannerPreviewModal
```

Component không gọi backend trực tiếp.

---

## `constants/`

Chứa business/static configuration.

Ví dụ:

```text
banner dimensions
max upload size
accepted MIME types
title length
sort order constraints
```

Không hard-code lặp lại các giá trị này ở nhiều component.

---

## `utils/`

Chứa image-processing logic không thuộc presentation.

Ví dụ:

```text
read image dimensions
validate image type
compress image
format file size
prepare upload file
```

---

# 6. MarketingPage

Location:

```text
pages/MarketingPage/
```

`MarketingPage` là orchestration layer của feature.

Nó kết nối:

```text
ManagementPageHeader
BannerStats
BannerToolbar
BannerTable
BannerCreateModal
BannerPreviewModal
ConfirmModal
AppToast
useBannerManagement
```

Page không sở hữu:

```text
table columns
image compression
upload interaction
preview layout
backend transport
```

---

# 7. Page header

Marketing sử dụng shared:

```text
ManagementPageHeader
PrimaryActionButton
```

Header hiện có:

```text
Quảng cáo

Quản lý banner quảng cáo hiển thị tới khách hàng.

[Làm mới] [+ Thêm quảng cáo]
```

Không sử dụng lại legacy header:

```text
BodyHeaderFirst
```

Không có search box trong page header.

Search chỉ xuất hiện tại context của danh sách quảng cáo.

---

# 8. BannerStats

Component:

```text
BannerStats
```

Hiển thị ba số liệu:

```text
Tổng quảng cáo
Đang hiển thị
Đang ẩn
```

UI sử dụng stat strip nhẹ thay vì ba dashboard card nặng.

Không dùng:

```text
gradient lớn
icon trang trí lớn
shadow mạnh
màu rainbow
```

Màu chỉ hỗ trợ semantic status nhẹ.

---

# 9. BannerToolbar

Component:

```text
BannerToolbar
```

Chịu trách nhiệm cho:

```text
search
status filter
filtered count
```

Search hiện theo:

```text
title
```

Status filter:

```text
Tất cả
Hiển thị
Đã ẩn
```

Search và filter là presentation state.

Chúng chưa phải server query state.

---

# 10. BannerTable

Component:

```text
BannerTable
```

Table chịu trách nhiệm presentation cho:

```text
banner image
title
sort order
status
created date
actions
pagination
empty state
```

Actions gồm:

```text
ẩn / hiện
preview
delete
```

Table không tự mutation backend.

Nó chỉ emit callbacks:

```text
onPreview
onToggleVisibility
onDelete
```

---

# 11. Banner thumbnail

Banner source có kích thước:

```text
1080 × 1350
```

Tỉ lệ:

```text
4:5
```

Do đó thumbnail trong table cũng giữ:

```text
4:5
```

Baseline thumbnail:

```text
64 × 80
```

Không crop banner thành thumbnail ngang.

Legacy behavior:

```text
132 × 74
```

đã được loại bỏ.

Lý do:

> Người quản lý cần nhìn được composition thực tế của banner thay vì một crop landscape không đúng nội dung thật.

---

# 12. Banner status

Hai trạng thái chính:

```text
Đang hiển thị
Đang ẩn
```

Status presentation sử dụng:

```text
badge nhẹ
small semantic dot
low-saturation background
```

Không dùng màu quá mạnh.

---

# 13. BannerCreateModal

Component:

```text
BannerCreateModal
```

Modal chịu trách nhiệm:

```text
form state
title
sort order
file selection
drag & drop
preview
image validation feedback
image compression feedback
submit payload
```

Parent chỉ nhận:

```js
{
  title,
  sortOrder,
  file,
}
```

Page không cần biết file đã được validate/compress như thế nào.

---

# 14. Create form structure

Modal được chia thành hai section:

```text
Thông tin
├── Tiêu đề
└── Thứ tự hiển thị

Hình ảnh
├── Upload
├── Preview
├── Requirement
└── Validation feedback
```

Không trình bày form thành một khối phẳng dài.

---

# 15. Banner image requirements

Source of truth:

```text
constants/bannerConfig.js
```

Requirement hiện tại:

```text
Kích thước:
1080 × 1350 px

Tỉ lệ:
4:5

Dung lượng tối đa:
4.5 MB

Format:
JPEG
PNG
WEBP
```

UI copy phải luôn khớp các requirement này.

Không sử dụng wording legacy:

```text
ảnh ngang
```

vì banner hiện là ảnh dọc 4:5.

---

# 16. Image upload UX

User có thể:

```text
click để chọn ảnh
```

hoặc:

```text
drag & drop
```

File input được trigger bằng React ref.

Không sử dụng:

```js
document.getElementById(...)
```

để điều khiển file input.

---

# 17. Image validation

Image processing nằm tại:

```text
utils/bannerImage.js
```

Validation hiện gồm:

```text
MIME type
image dimensions
file size
```

Ảnh sai kích thước bị reject.

Ví dụ:

```text
required:
1080 × 1350

received:
1200 × 1200

→ reject
```

---

# 18. Image compression

Nếu ảnh đúng dimensions nhưng vượt:

```text
4.5 MB
```

frontend sẽ thử compress ảnh.

Nếu thành công:

```text
6.12MB
 ↓
3.94MB
```

UI hiển thị optimization feedback trực tiếp trong modal.

Không phụ thuộc vào toast tạm thời cho thông tin này.

Nếu không thể giảm xuống dưới limit mà vẫn giữ quality threshold phù hợp:

```text
→ reject
```

---

# 19. BannerPreviewModal

Component:

```text
BannerPreviewModal
```

Hiển thị:

```text
title
status
sort order
created date
banner image
```

Preview giữ aspect ratio:

```text
4:5
```

Không ép ảnh thành landscape.

Preview là read-only presentation component.

---

# 20. Confirmation

Marketing sử dụng shared:

```text
ConfirmModal
```

Không dùng trực tiếp:

```text
Modal.confirm
window.confirm
```

Confirmation áp dụng cho:

```text
hide/show
delete
```

Semantic:

```text
delete
→ destructive
→ danger

hide
→ reversible
→ không danger

show
→ reversible
→ không danger
```

Không dùng màu đỏ cho mọi action mang ý nghĩa "negative".

---

# 21. Application feedback

Marketing sử dụng:

```text
AppToast
```

Không dùng trực tiếp:

```text
notification
alert
```

Toast được trigger ở orchestration layer.

API layer và presentation component không tự tạo application toast.

---

# 22. Mutation feedback rule

Mutation failure và refresh failure là hai trạng thái khác nhau.

```text
mutation ❌
→ thao tác thất bại
```

nhưng:

```text
mutation ✅
refresh ❌
→ thao tác đã thành công
→ UI chưa thể tải lại dữ liệu
```

Không báo:

```text
"Cập nhật thất bại"
```

nếu backend đã lưu thay đổi thành công.

Trong case refresh fail sau mutation, user được thông báo:

```text
thao tác đã thành công
+
danh sách chưa thể làm mới
+
có thể bấm Làm mới
```

---

# 23. useBannerManagement

Hook:

```text
hooks/useBannerManagement.js
```

Public responsibilities:

```text
banners
loading
loadError

creating

processingBannerId
processingAction

refresh
clearLoadError

createBanner
toggleBannerVisibility
deleteBanner
```

---

# 24. Request stale protection

Hook có stale request protection.

Ví dụ:

```text
request A
request B

B response
 ↓
update state

A response đến sau
 ↓
ignore
```

Response cũ không được overwrite response mới.

Request stale không được xem là request failure.

```text
stale
≠
error
```

---

# 25. Double-submit protection

Create mutation có hai lớp bảo vệ:

```text
UI disabled/loading
+
hook-level ref guard
```

Không chỉ dựa vào disabled button.

Hook contract cho create:

```text
request thành công
→ { ok: true }

request bị skip do duplicate submit
→ { ok: false, skipped: true }

request lỗi
→ throw
```

Không phụ thuộc vào việc backend response body có truthy hay không.

---

# 26. Row mutation state

Hook giữ:

```text
processingBannerId
processingAction
```

thay vì một global mutation boolean duy nhất.

Điều này giúp presentation hiểu:

```text
record nào đang được xử lý
```

và:

```text
đang toggle hay delete
```

---

# 27. Search / filter ownership

Các state:

```text
searchText
statusFilter
```

hiện thuộc:

```text
MarketingPage
```

không thuộc:

```text
useBannerManagement
```

Lý do:

```text
search/filter hiện tại
=
client-side presentation state
```

Nếu sau này backend hỗ trợ:

```text
server pagination
server filtering
server search
```

ownership có thể được đánh giá lại trong Data / Runtime phase.

---

# 28. Preview ownership

State:

```text
previewBanner
```

thuộc page.

Nếu banner đang preview bị xóa:

```text
previewBanner.id
===
deletedBanner.id
```

preview phải đóng.

Không giữ stale entity trong modal sau khi record đã bị delete.

---

# 29. API boundary

Feature API:

```text
api/banners.api.js
```

Cung cấp:

```text
fetchBanners
createBanner
setBannerVisibility
deleteBanner
```

UI/hook không import trực tiếp transport implementation.

---

# 30. API migration state

Marketing hiện có boundary:

```text
MarketingPage
 ↓
useBannerManagement
 ↓
features/marketing/api
 ↓
services/marketing
```

`features/marketing/api` hiện đóng vai trò adapter cho transport legacy.

File:

```text
src/services/marketing.js
```

vẫn được giữ.

Không xóa transport này trong UI migration.

Việc refactor:

```text
HTTP client
cache
retry
server state
request deduplication
upload transport
```

được deferred sang Data / Runtime phase.

---

# 31. Error handling

Flow:

```text
transport
 ↓
feature API
 ↓
hook
 ↓
page
 ↓
AppToast
```

Error description được normalize thông qua shared utility khi phù hợp:

```text
getErrorDescription
```

Presentation component không cần hiểu:

```text
Axios error
HTTP status
transport response shape
```

---

# 32. Marketing visual language

Feature sử dụng cùng visual language với các management screen mới.

Baseline:

```text
neutral background
warm Freshy accent
subtle borders
minimal shadow
compact typography
clear information hierarchy
low visual noise
```

Không quay lại style legacy:

```text
blue dashboard theme
large gradient cards
rainbow stat colors
shadow-heavy UI
oversized management title
```

---

# 33. Typography

General management density:

```text
Page title        shared header baseline
Section title     ~13–16px
Field value       ~14px
Field label       ~13px
Meta/helper       ~10–12px
Status            ~11px
```

Custom components không tự tạo typography scale riêng nếu không có lý do UX cụ thể.

---

# 34. Responsive baseline

Feature hiện hỗ trợ responsive baseline cho:

```text
desktop
tablet
mobile
```

Behavior đáng chú ý:

```text
header actions wrap
stats stack
toolbar stack
search full width
form grid → one column
image requirement grid → one column
preview modal scales theo viewport
```

Đây chưa phải mobile-first product redesign.

Mục tiêu hiện tại là:

```text
usable
readable
non-breaking
```

trên viewport nhỏ.

---

# 35. Shared dependencies

Marketing sử dụng shared components/utilities như:

```text
ManagementPageHeader
PrimaryActionButton
ConfirmModal
AppToast
getErrorDescription
```

Không duplicate các abstraction này bên trong feature.

---

# 36. What Marketing does not own

Marketing không sở hữu:

```text
authentication
global navigation
customer management
orders
POS
addresses
user registration
global upload architecture
global caching strategy
global realtime strategy
```

Marketing chỉ sở hữu business/frontend logic có meaning trực tiếp với advertising banner.

---

# 37. Shared rule

Không chuyển component vào `shared` chỉ vì:

```text
"có thể sau này feature khác dùng"
```

Rule:

> Shared is earned.

Component chỉ được promote khi:

1. feature thứ hai thực sự cần;
2. behavior thực sự giống;
3. API component không còn phụ thuộc business language riêng của Marketing.

Các component hiện tại:

```text
BannerStats
BannerToolbar
BannerTable
BannerCreateModal
BannerPreviewModal
```

vẫn thuộc Marketing.

---

# 38. Legacy cleanup

Legacy Marketing resources đã được loại bỏ:

```text
src/pages/Marketing/
```

Các legacy helper/component như:

```text
BodyHeaderFirst
SearchBar
```

không được promote lên shared nếu không còn consumer.

Không giữ dead abstraction chỉ vì chúng từng tồn tại.

---

# 39. Legacy migration rule

Khi migrate code cũ:

```text
find runtime consumer
 ↓
move responsibility
 ↓
update imports
 ↓
verify
 ↓
switch route
 ↓
remove legacy
```

Không tạo thêm:

```text
MarketingV2
MarketingNew
components_new
final
new_final
```

để né migration.

---

# 40. Documentation rule

Mỗi thay đổi architecture đáng kể phải cập nhật:

```text
README.md
```

trong cùng step/commit.

Không để documentation dồn về cuối rồi quên.

---

# 41. Things intentionally deferred

Phase hiện tại tập trung vào:

```text
frontend architecture
UI / UX
feature boundary
component ownership
basic request correctness
legacy migration
documentation
```

Các vấn đề sau được cố tình để sang Data / Runtime phase:

```text
server-state caching
request deduplication toàn hệ thống
React Query / equivalent server-state architecture
optimistic mutations
automatic retry strategy
upload progress
upload cancellation
offline behavior
realtime banner synchronization
WebSocket / FCM
backend contract redesign
API transport migration
performance profiling
image CDN strategy
image resizing pipeline
```

Không mở lại Marketing UI chỉ để xử lý các vấn đề trên.

---

# 42. Completion checklist

Frontend/UI refactor của Marketing:

```text
Feature boundary                  ✅
Direct feature route              ✅
Legacy page removal               ✅

Shared management header          ✅
Banner overview                   ✅
Banner search                     ✅
Banner status filtering           ✅

Banner table                      ✅
Correct 4:5 thumbnail             ✅
Banner status presentation        ✅
Banner row actions                ✅

Banner preview modal              ✅
4:5 preview                       ✅

Banner create modal               ✅
Image drag and drop               ✅
File input ref                    ✅
Image MIME validation             ✅
Image dimension validation        ✅
Image compression                 ✅
Image preview                     ✅
Image requirement source          ✅

Shared ConfirmModal               ✅
Shared AppToast                   ✅

Feature API boundary              ✅
Banner management hook            ✅

Stale fetch protection            ✅
Double-submit protection          ✅
Mutation / refresh separation     ✅
Stale refresh distinction         ✅

Responsive baseline               ✅
Legacy component cleanup          ✅
Feature documentation             ✅
```

---

# 43. Migration status

```text
M11-B1  Audit hiện trạng                    ✅ DONE
M11-B2  Feature boundary                    ✅ DONE
M11-B3  MarketingPage + shared header       ✅ DONE
M11-B4  Banner stats + toolbar              ✅ DONE
M11-B5  Banner table                        ✅ DONE
M11-B6  Banner create modal + image UX      ✅ DONE
M11-B7  Banner preview modal                ✅ DONE
M11-B8  Confirm + toast consistency         ✅ DONE
M11-B9  Frontend state extraction           ✅ DONE
M11-B10 Direct route switch                 ✅ DONE
M11-B11 Legacy cleanup                      ✅ DONE
M11-B12 Final QA + documentation close      ✅ DONE
```

---

# 44. Final architecture

```text
MarketingPage
│
├── presentation state
│   ├── search
│   ├── status filter
│   ├── create modal
│   ├── preview modal
│   └── confirm state
│
├── useBannerManagement
│   │
│   ├── banners
│   ├── loading
│   ├── creating
│   ├── mutation state
│   ├── refresh
│   ├── create
│   ├── toggle
│   └── delete
│   │
│   ↓
│
├── marketing/api
│   ↓
│
└── services/marketing
```

Presentation:

```text
MarketingPage
│
├── ManagementPageHeader
│
├── BannerStats
│
├── BannerToolbar
│
├── BannerTable
│
├── BannerCreateModal
│
├── BannerPreviewModal
│
└── ConfirmModal
```

Image flow:

```text
BannerCreateModal
       ↓
prepareBannerImage
       ↓
validate MIME
       ↓
validate dimensions
       ↓
compress if required
       ↓
validated File
       ↓
MarketingPage
       ↓
useBannerManagement
       ↓
feature API
       ↓
backend
```

---

# 45. Rules for future changes

Nếu sửa Marketing trong tương lai:

1. Không gọi backend trực tiếp từ component.
2. Không import `services/marketing` ngoài feature API adapter.
3. Không đưa presentation state vào server hook nếu không cần.
4. Không hard-code image constraints ngoài `bannerConfig`.
5. Không crop banner 4:5 thành landscape trong management UI.
6. Không dùng `notification`, `Modal.confirm`, `alert` hoặc `window.confirm` trực tiếp.
7. Dùng `AppToast` cho application feedback.
8. Dùng `ConfirmModal` cho confirmation.
9. Không báo mutation thất bại nếu mutation đã thành công nhưng refresh lỗi.
10. Không coi stale request là request failure.
11. Không tạo component `v2/new/final` để né migration.
12. Không promote component lên shared trước khi có reuse thực tế.
13. Architecture thay đổi thì README phải cập nhật cùng commit.
14. Server-state/cache/realtime work để đúng Data / Runtime phase.
15. UI chỉ mở lại nếu có bug, regression hoặc requirement mới.

---

# 46. Phase status

```text
MARKETING / ADVERTISING

UI / FRONTEND REFACTOR

✅ CLOSED
```

Marketing được xem là hoàn thành ở frontend/UI phase.

Không tiếp tục polish feature nếu không có:

```text
bug
regression
business requirement mới
```

Các vấn đề liên quan tới:

```text
backend
cache
latency
realtime
optimistic update
retry
upload transport
performance
```

được chuyển sang phase Data / Runtime sau khi frontend migration hoàn tất.
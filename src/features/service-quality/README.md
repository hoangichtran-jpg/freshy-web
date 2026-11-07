# Service Quality

`service-quality` là feature quản lý frontend flow liên quan đến đánh giá chất lượng dịch vụ từ khách hàng trong Freshy Web Manager.

UI terminology:

```text
Chất lượng dịch vụ
```

Legacy/backend terminology hiện tại:

```text
request rate
rate
```

Public route hiện tại:

```text
/manager-request-rate
```

Route được giữ nguyên để tránh ảnh hưởng tới navigation, bookmark và deep link hiện có.

---

# Status

```text
M12 — Service Quality
CLOSED
```

Migration progress:

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

---

# Feature responsibilities

Feature hiện chịu trách nhiệm cho:

```text
load customer reviews
normalize review data
loading state
error state
manual refresh

frontend statistics

search
rating filter
sorting
pagination

review table
review detail
image preview

empty states
responsive presentation
```

Feature hiện tại là read-only.

Không có mutation business được implement vì backend/domain contract hiện tại chưa chứng minh có workflow chỉnh sửa hoặc xử lý review.

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

Service Quality flow:

```text
ServiceQualityPage
        ↓
useServiceQuality
        ↓
service-quality/api
        ↓
services/requestRate
        ↓
backend
```

Presentation components không gọi legacy transport trực tiếp.

---

# Folder structure

```text
src/features/service-quality/
├── api/
│   ├── index.js
│   └── serviceQuality.api.js
│
├── components/
│   ├── ServiceQualityDetailModal/
│   │   ├── index.js
│   │   └── ServiceQualityDetailModal.scss
│   │
│   ├── ServiceQualityStats/
│   │   ├── index.js
│   │   └── ServiceQualityStats.scss
│   │
│   ├── ServiceQualityTable/
│   │   ├── index.js
│   │   └── ServiceQualityTable.scss
│   │
│   ├── ServiceQualityToolbar/
│   │   ├── index.js
│   │   └── ServiceQualityToolbar.scss
│   │
│   └── index.js
│
├── hooks/
│   ├── index.js
│   └── useServiceQuality.js
│
├── pages/
│   ├── ServiceQualityPage/
│   │   ├── index.js
│   │   └── ServiceQualityPage.scss
│   └── index.js
│
├── index.js
└── README.md
```

---

# Backend contract currently used

Frontend hiện sử dụng các field:

```text
customerPhone
rateScore
rateNote
imagePaths
```

Feature không tự giả định các field chưa được backend contract hiện tại chứng minh như:

```text
createdAt
orderId
requestId
posId
posName
status
resolved
assignedTo
```

Các requirement ngoài current frontend scope được theo dõi trong:

```text
docs/PROJECT_BACKLOG.md
```

---

# API ownership

Feature API:

```text
src/features/service-quality/api/
```

Public operation:

```text
fetchServiceQualityReviews(managerPhone)
```

Feature API hiện wrap legacy transport:

```text
src/services/requestRate.js
```

Current dependency:

```text
ServiceQualityPage
        ↓
useServiceQuality
        ↓
fetchServiceQualityReviews
        ↓
getRequestRate
```

Transport migration sang shared HTTP client được deferred sang backend/runtime phase.

---

# Data hook

Hook:

```text
useServiceQuality(managerPhone)
```

chịu trách nhiệm:

```text
fetch reviews
loading state
load error
manual refresh
normalization
stale request protection
```

Hook không sở hữu presentation state như:

```text
searchText
selectedReview
table filters
modal open state
```

Các state đó thuộc page/component layer.

---

# Data normalization

## Rating

Valid rating:

```text
1 → 5
```

Backend value hợp lệ được normalize thành number.

Invalid value được normalize thành:

```text
null
```

Không convert invalid rating thành:

```text
0
```

vì:

```text
invalid backend data
≠
0-star business rating
```

Việc này tránh làm sai:

```text
average score
attention count
sort
rating filter
```

---

## Feedback

`rateNote` luôn được normalize thành string.

Nếu không có nội dung:

```text
""
```

Presentation layer hiển thị empty state phù hợp.

---

## Images

`imagePaths` luôn được normalize thành array.

Invalid/non-array response:

```text
[]
```

Image load error sử dụng fallback image của application.

---

# Client key

Backend contract hiện tại chưa chứng minh có stable review ID.

Feature ưu tiên các field sau nếu response có:

```text
id
rateId
requestRateId
```

Nếu không có, frontend tạo:

```text
clientKey
```

chỉ phục vụ React list/table rendering.

`clientKey` không phải domain identifier và không được dùng cho mutation.

Stable backend ID được theo dõi trong project backlog.

---

# Error behavior

Legacy implementation từng có behavior:

```text
API fails
→ render FAKE_REQUEST_RATES
```

Behavior này đã bị loại bỏ.

Feature mới:

```text
API fails
→ error feedback
→ refresh / retry
```

Frontend không hiển thị customer feedback giả như production data.

---

# Page structure

```text
ManagementPageHeader
│
├── Chất lượng dịch vụ
├── Description
└── Làm mới
│
ServiceQualityStats
│
├── Tổng đánh giá
├── Điểm trung bình
└── Cần chú ý
│
ServiceQualityToolbar
│
└── Search
│
ServiceQualityTable
│
├── Khách hàng
├── Điểm đánh giá
├── Phản hồi
└── Hình ảnh
│
ServiceQualityDetailModal
├── Customer
├── Rating
├── Full feedback
└── Image gallery
```

---

# Page header

Title:

```text
Chất lượng dịch vụ
```

Description:

```text
Theo dõi đánh giá và phản hồi từ khách hàng.
```

Current page action:

```text
Làm mới
```

Không có primary CTA vì feature hiện tại là read-only.

Không tự tạo action business như:

```text
Resolve
Reply
Assign
Delete
Edit
```

khi domain/API chưa hỗ trợ.

---

# Statistics

Frontend hiện derive ba metrics.

## Tổng đánh giá

```text
reviews.length
```

## Điểm trung bình

Average chỉ tính rating hợp lệ:

```text
1 → 5
```

Invalid score không tham gia calculation.

## Cần chú ý

Current frontend presentation rule:

```text
rateScore <= 2
```

Rule này chưa được coi là business/domain rule chính thức.

Business threshold cần được review riêng và đã được ghi vào project backlog.

---

# Stats visual design

Stats sử dụng một shared surface:

```text
┌────────────────┬────────────────┬────────────────┐
│ Tổng đánh giá  │ Điểm trung bình│ Cần chú ý      │
│      128       │     4.6 / 5    │       7        │
└────────────────┴────────────────┴────────────────┘
```

Không sử dụng ba dashboard cards với shadow mạnh.

Design direction:

```text
white neutral surface
subtle borders
warm Freshy accent
restrained semantic color
minimal decorative UI
```

---

# Search

Toolbar search hỗ trợ:

```text
customerPhone
formatted customerPhone
rateNote
```

Phone search normalize digits để user có thể tìm linh hoạt giữa raw backend format và display format.

Search hiện chạy local trên dataset đã load.

Server-side search được deferred.

---

# Table

Feature reuse:

```text
ManagementTable
```

Shared table chịu trách nhiệm:

```text
container
table header
scrollable body
pagination area
shared border
shared radius
shared spacing
shared scrollbar
basic table behavior
```

`ServiceQualityTable` chỉ sở hữu business-specific presentation và interaction.

---

# Table columns

```text
Khách hàng
Điểm đánh giá
Phản hồi
Hình ảnh
```

Không dùng cột:

```text
STT
```

vì không cung cấp business value đáng kể cho màn management này.

Không dùng action column chỉ để có button:

```text
Xem
```

Row chính là interaction mở detail.

---

# Rating presentation

Table sử dụng compact rating:

```text
★ 4 / 5
```

thay cho:

```text
★★★★☆
```

trên từng row.

Lý do:

```text
faster scanning
less horizontal noise
better fit for management table
```

Semantic colors:

```text
1–2   muted red
3     warm amber
4–5   muted green
```

Color chỉ hỗ trợ scan, không thay thế numeric score.

---

# Rating filtering

Column `Điểm đánh giá` hỗ trợ:

```text
5 sao
4 sao
3 sao
2 sao
1 sao
```

Filter cho phép chọn nhiều mức.

Ví dụ:

```text
1 sao
+
2 sao
```

để manager scan nhóm review cần chú ý.

Không tạo filter rating duplicate ở toolbar.

---

# Sorting

Current table hỗ trợ sorting cho:

```text
customer phone
rating score
```

Date sorting chưa tồn tại vì backend contract hiện tại chưa có review timestamp.

Frontend không invent timestamp.

---

# Feedback presentation

Trong table:

```text
rateNote
→ tối đa 2 dòng
→ truncate nếu dài
```

Trong detail:

```text
rateNote
→ full content
→ preserve line breaks
```

Empty feedback:

```text
Khách hàng không để lại nội dung phản hồi.
```

---

# Images

Table chỉ hiển thị:

```text
N ảnh
```

Không preview image trực tiếp trong table cell.

Interaction:

```text
click row
→ review detail
→ image gallery
→ click thumbnail
→ Ant Design image preview
```

Nếu không có image:

```text
Không có hình ảnh đính kèm
```

Không render gallery rỗng.

---

# Row interaction

Review row hỗ trợ:

```text
mouse click
Enter
Space
```

Row có keyboard focus state.

Interaction:

```text
row
→ ServiceQualityDetailModal
```

Không cần separate `Xem` action.

---

# Detail modal

`ServiceQualityDetailModal` là read-only.

Hiển thị:

```text
customer phone
rating
full feedback
image count
image gallery
```

Modal không có mutation/footer action.

Header cố định.

Body dài scroll riêng.

---

# Pagination

Current frontend pagination:

```text
10 reviews / page
```

Search thay đổi:

```text
page → 1
```

Rating filter thay đổi:

```text
page → 1
```

Nếu dataset nhỏ lại:

```text
current page
→ clamp về valid page
```

Server pagination được deferred.

---

# Layout

Desktop target:

```text
Page Header     fixed
Stats           fixed
Toolbar         fixed
Table Header    fixed
Rows            scroll
Pagination      fixed
```

Whole page không phải scroll container chính.

Mobile được phép fallback sang vertical document layout.

---

# Shared components

Feature reuse:

```text
ManagementPageHeader
ManagementTable
AppToast
getErrorDescription
```

Feature-owned components:

```text
ServiceQualityStats
ServiceQualityToolbar
ServiceQualityTable
ServiceQualityDetailModal
```

Rule:

> Shared is earned.

Không promote Service Quality specific UI vào shared khi chưa có reuse thực tế.

---

# Route migration

Runtime route hiện trỏ trực tiếp tới:

```text
ServiceQualityPage
```

Legacy route path vẫn được giữ:

```text
config.routes.manage_request_rate
```

Việc giữ path giúp tránh migration không cần thiết cho:

```text
navigation
bookmark
deep link
existing references
```

UI terminology đã được đổi thành:

```text
Chất lượng dịch vụ
```

nên technical route naming cũ không ảnh hưởng trải nghiệm người dùng.

---

# Legacy cleanup

Legacy implementations đã được loại khỏi runtime:

```text
src/pages/ManageRequestRate/
src/components/RequestRateList/
```

Legacy config usage:

```text
config.getRequestRate
```

đã được loại bỏ.

`services/requestRate.js` vẫn tồn tại vì hiện là transport dependency của feature API.

Final dependency:

```text
features/service-quality/api
        ↓
services/requestRate
```

Không đi qua global service aggregator.

---

# Deferred work

Các concern không thuộc frontend UI phase được ghi tại:

```text
docs/PROJECT_BACKLOG.md
```

Service Quality hiện có deferred/backend concerns gồm:

```text
stable review identifier
created timestamp
order/request context
POS/kitchen context
attention threshold definition
review workflow/status
server pagination/search
aggregate analytics
image delivery optimization
transport architecture
```

Không giải quyết các concern này trong M12.

---

# Final result

M12 đã hoàn thành:

```text
legacy page
→ feature architecture

fake fallback
→ explicit error state

basic table
→ management table

button-based image view
→ review-level detail interaction

raw presentation
→ consistent Freshy management UI
```

Service Quality frontend migration:

```text
CLOSED
```

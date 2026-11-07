# User Registration

Feature quản lý các yêu cầu đăng ký người dùng của Freshy Web Manager.

Feature hiện chịu trách nhiệm cho 2 route:

- `/register-agency` — Yêu cầu đăng ký đại lý
- `/register-shipper` — Yêu cầu đăng ký nhân viên giao hàng

> Lưu ý: hiện repository chưa có backend API thật cho danh sách đăng ký chờ duyệt / phê duyệt / từ chối. Feature đang dùng mock state nội bộ để hoàn thiện architecture và UI mà không tự bịa API contract.

---

## 1. Cấu trúc

```text
src/features/user-registration/
├── components/
│   ├── RegistrationRequestsTable/
│   │   ├── index.js
│   │   └── RegistrationRequestsTable.scss
│   └── index.js
│
├── constants/
│   └── registrationTypes.js
│
├── data/
│   └── registrationRequests.js
│
├── hooks/
│   ├── index.js
│   └── useRegistrationRequests.js
│
├── pages/
│   ├── AgencyRegistrationPage/
│   │   └── index.js
│   ├── RegistrationRequestsPage/
│   │   ├── index.js
│   │   └── RegistrationRequestsPage.scss
│   ├── ShipperRegistrationPage/
│   │   └── index.js
│   └── index.js
│
├── index.js
└── README.md
```

---

## 2. Feature boundary

`user-registration` chỉ xử lý **yêu cầu đăng ký đang chờ xử lý**.

Bao gồm:

```text
Agency registration request
Shipper registration request
```

Không thuộc feature này:

```text
src/pages/AgencyManage
src/pages/ManageShipper
src/services/agency.js
src/services/shipper.js
AgencyForm
ShipperForm
```

Các phần trên thuộc domain quản lý/tạo user đã tồn tại, không phải pending registration workflow.

---

## 3. Kiến trúc

Luồng hiện tại:

```text
Route page
   ↓
RegistrationRequestsPage
   ↓
useRegistrationRequests
   ↓
mock registrationRequests
```

Presentation:

```text
RegistrationRequestsPage
   ↓
RegistrationRequestsTable
```

Khi backend có API thật, target architecture:

```text
Route page
   ↓
RegistrationRequestsPage
   ↓
useRegistrationRequests
   ↓
registrations.api
   ↓
backend
```

Page/component không cần biết data đến từ mock hay backend.

---

## 4. Registration types

Hai loại registration được định nghĩa tập trung tại:

```text
src/features/user-registration/constants/registrationTypes.js
```

Các type hiện có:

```js
REGISTRATION_TYPES.AGENCY
REGISTRATION_TYPES.SHIPPER
```

Metadata theo type gồm:

```text
title
description
subjectLabel
approveSuccessMessage
rejectSuccessMessage
```

Không hard-code copy/text riêng rải rác trong từng page.

---

## 5. Mock data

Mock data hiện nằm tại:

```text
src/features/user-registration/data/registrationRequests.js
```

Business model dùng chung:

```js
{
  id: "agency-1",
  type: "agency",
  name: "Nguyễn Văn A",
  phone: "0987654321",
  address: "..."
}
```

Không dùng `key` của Ant Design làm business identifier.

`getInitialRegistrationRequests(type)` trả về bản copy mới để tránh mutate trực tiếp constant mock.

---

## 6. Hook ownership

Business state nằm tại:

```text
src/features/user-registration/hooks/useRegistrationRequests.js
```

Hook chịu trách nhiệm:

```text
requests
filteredRequests
searchValue
processingId
processingAction
approveRequest
rejectRequest
resetSearch
resetRequests
```

Page không trực tiếp mutate danh sách registration.

---

## 7. Approve / Reject behavior

Hiện chưa có backend API thật.

Vì đây là danh sách yêu cầu đang chờ xử lý:

```text
approve
hoặc
reject
```

đều làm request rời khỏi pending list.

Hiện behavior này chỉ tồn tại trong local state.

Reload browser sẽ khôi phục mock data.

Không được hiểu đây là dữ liệu đã được lưu server.

---

## 8. Pages

### Agency

Route:

```text
/register-agency
```

Entry page:

```text
AgencyRegistrationPage
```

Page này chỉ cấu hình:

```js
type={REGISTRATION_TYPES.AGENCY}
```

### Shipper

Route:

```text
/register-shipper
```

Entry page:

```text
ShipperRegistrationPage
```

Page này chỉ cấu hình:

```js
type={REGISTRATION_TYPES.SHIPPER}
```

Hai page không duplicate business logic.

---

## 9. Shared orchestration page

Logic UI dùng chung nằm tại:

```text
pages/RegistrationRequestsPage
```

Page chịu trách nhiệm:

```text
ManagementPageHeader
search input
confirmation state
approve/reject orchestration
toast feedback
ConfirmModal
```

Hook chịu trách nhiệm state/business logic.

Table chịu trách nhiệm presentation.

---

## 10. RegistrationRequestsTable

Table dùng chung cho Agency và Shipper.

Columns:

```text
STT
Họ tên
Số điện thoại
Địa chỉ
Thao tác
```

Actions:

```text
Phê duyệt
Từ chối
```

Business terminology dùng `Từ chối`, không dùng `Xóa`, vì đây là registration request chứ không phải entity đã tồn tại.

---

## 11. Pagination

Client-side pagination:

```text
PAGE_SIZE = 10
```

Không hiển thị selector:

```text
10 / page
```

`showSizeChanger` được tắt.

Khi search thay đổi:

```text
→ quay về page 1
```

Khi approve/reject một row:

```text
→ giữ current page nếu page đó vẫn hợp lệ
```

Nếu page cuối không còn tồn tại:

```text
→ lùi về page hợp lệ gần nhất
```

---

## 12. Search

Search hỗ trợ:

```text
name
phone
address
```

Search input không bị sanitize vì đây không phải persisted business data.

Matching dùng lowercase locale tiếng Việt.

Empty state được phân biệt:

```text
Không search + không có request
→ "Chưa có yêu cầu đăng ký đang chờ xử lý."

Có search + không match
→ "Không tìm thấy yêu cầu phù hợp."
```

---

## 13. Confirmation

Approve:

```text
Xác nhận phê duyệt
```

Ví dụ:

```text
Bạn có chắc chắn muốn phê duyệt
Nguyễn Văn A
trở thành đại lý?
```

Reject:

```text
Xác nhận từ chối
```

Ví dụ:

```text
Bạn có chắc chắn muốn từ chối yêu cầu của
Nguyễn Văn A?
```

Dùng shared:

```text
src/shared/components/ConfirmModal
```

---

## 14. Feedback

Không gọi trực tiếp:

```js
notification.success(...)
notification.error(...)
message.success(...)
message.error(...)
```

Feature dùng:

```text
src/shared/components/AppToast
```

Error description dùng:

```text
src/shared/utils/getErrorDescription.js
```

---

## 15. Shared components

Feature reuse:

```text
ManagementPageHeader
ManagementTable
ConfirmModal
AppToast
```

Không tạo lại shell tương đương chỉ riêng cho registration.

`RegistrationRequestsTable` vẫn nằm trong feature vì columns/actions của nó là business-specific.

---

## 16. UI conventions

Feature theo Freshy design language.

Primary:

```text
#7b4b08
```

App background:

```text
#f6f3ef
```

Approve action:

```text
Freshy brown soft
```

Reject action:

```text
semantic red
```

Không dùng Ant Design blue làm interaction color chính.

---

## 17. Routes

Router phải import từ feature:

```js
import {
  AgencyRegistrationPage,
  ShipperRegistrationPage,
} from "../features/user-registration";
```

Mapping:

```text
/register-agency
→ AgencyRegistrationPage

/register-shipper
→ ShipperRegistrationPage
```

Legacy pages sau khi route switch phải được xóa:

```text
src/pages/RegisterAgency
src/pages/RegisterShipper
```

---

## 18. Backend integration sau này

Chỉ tạo API layer khi có contract backend thật.

Target:

```text
src/features/user-registration/
└── api/
    └── registrations.api.js
```

Các operation dự kiến về mặt domain:

```text
get pending requests
approve request
reject request
```

Tên endpoint, method và payload phải lấy từ backend contract thật.

Không tự bịa endpoint.

Khi nối API, ưu tiên giữ interface hiện tại của hook:

```js
approveRequest(request)
rejectRequest(request)
```

để page/table không phải viết lại.

---

## 19. Legacy cleanup

Legacy đã được thay thế:

```text
src/pages/RegisterAgency
src/pages/RegisterShipper
```

Không xóa:

```text
src/pages/AgencyManage
src/pages/ManageShipper
src/services/agency.js
src/services/shipper.js
```

vì chúng không thuộc registration request feature.

---

## 20. Definition of Done

### Architecture

```text
[ ] route trỏ vào feature mới
[ ] Agency/Shipper page không duplicate logic
[ ] state nằm trong hook
[ ] mock data không nằm trực tiếp trong page
[ ] table dùng chung trong feature
[ ] shared shell được reuse
```

### Agency Registration

```text
[ ] load mock request
[ ] search theo tên
[ ] search theo số điện thoại
[ ] search theo địa chỉ
[ ] approve confirm
[ ] reject confirm
[ ] toast success
[ ] empty state đúng
```

### Shipper Registration

```text
[ ] load mock request
[ ] search theo tên
[ ] search theo số điện thoại
[ ] search theo địa chỉ
[ ] approve confirm
[ ] reject confirm
[ ] toast success
[ ] empty state đúng
```

### UI

```text
[ ] ManagementPageHeader
[ ] ManagementTable
[ ] ConfirmModal
[ ] AppToast
[ ] không có AntD blue action chính
[ ] không có page-size selector
[ ] responsive không vỡ layout
```

### Cleanup

```text
[ ] không còn RegisterAgency legacy
[ ] không còn RegisterShipper legacy
[ ] không có notification/message trực tiếp trong feature
[ ] không có API endpoint tự bịa
[ ] npm run build passes
```

---

## 21. Final QA commands

Kiểm tra legacy:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  --include='*.scss' \
  -E 'RegisterAgency|RegisterShipper|pages/RegisterAgency|pages/RegisterShipper' \
  src
```

Kỳ vọng:

```text
không có output
```

Kiểm tra toast cũ:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'notification\.(success|error|warning|info)|message\.(success|error|warning|info)' \
  src/features/user-registration
```

Kỳ vọng:

```text
không có output
```

Kiểm tra hard-coded registration API đáng ngờ:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -Ei 'registration.*(approve|reject|pending)|approve.*registration|reject.*registration' \
  src/features/user-registration
```

Nếu chỉ match comment/documentation thì kiểm tra thủ công.

Build:

```bash
npm run build
```

Cuối cùng:

```bash
git status --short
```

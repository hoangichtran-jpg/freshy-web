# Address Management

Feature `address-management` quản lý toàn bộ luồng địa chỉ trong Freshy Web Manager.

```text
src/features/address-management/
```

Feature hiện phục vụ hai màn hình chính:

```text
/manager-address
/manage-pos-address
```

Phase **UI / frontend refactor** của Address Management đã hoàn thành.

---

## 1. Feature responsibilities

`address-management` chịu trách nhiệm cho các luồng liên quan đến địa chỉ.

### Quản lý địa chỉ

```text
Quản lý địa chỉ
├── xem danh sách địa chỉ
├── tìm kiếm địa chỉ
├── tạo địa chỉ
├── chỉnh sửa địa chỉ
├── ngừng sử dụng địa chỉ
├── gán đại lý cho địa chỉ
├── cấu hình thông tin đặt hàng
└── gán địa chỉ cho POS / trung tâm
```

### Quản lý địa chỉ theo POS

```text
Địa chỉ theo POS
├── chọn trung tâm
├── xem địa chỉ thuộc trung tâm
├── tìm kiếm địa chỉ
├── cập nhật phí giao hàng
├── ngừng sử dụng mapping POS ↔ địa chỉ
└── sao chép đường dẫn đặt hàng
```

Feature này sở hữu:

- UI thuộc domain Address Management;
- state cục bộ của feature;
- hooks phục vụ Address Management;
- API contracts có ý nghĩa riêng với Address;
- các business interaction thuộc màn quản lý địa chỉ.

---

# 2. Routes

## Quản lý địa chỉ

```text
/manager-address
```

Entry page:

```text
AddressManagementPage
```

---

## Địa chỉ theo trung tâm

```text
/manage-pos-address
```

Entry page:

```text
PosAddressManagementPage
```

Public exports:

```js
export {
  AddressManagementPage,
  PosAddressManagementPage,
} from "./pages";
```

Router không cần phụ thuộc vào các Address page legacy.

---

# 3. Current feature structure

```text
src/features/address-management/
├── api/
│   ├── addresses.api.js
│   ├── agencyAddresses.api.js
│   ├── posAddresses.api.js
│   └── index.js
│
├── components/
│   ├── AddressFormModal/
│   ├── AddressManagementTable/
│   ├── AddressOrderInfoModal/
│   │   ├── AgencySelect/
│   │   ├── ExactTimePicker/
│   │   ├── AddressOrderInfoModal.scss
│   │   └── index.js
│   ├── AddressPosAssignmentModal/
│   ├── PosAddressFeeModal/
│   ├── PosAddressTable/
│   └── index.js
│
├── constants/
│   ├── addressOptions.js
│   └── index.js
│
├── hooks/
│   ├── useAddressAgencies.js
│   ├── useAddressAgencyAssignment.js
│   ├── useAddressMutations.js
│   ├── useAddressPosAssignment.js
│   ├── useManagedAddresses.js
│   ├── usePosAddresses.js
│   └── index.js
│
├── pages/
│   ├── AddressManagementPage/
│   ├── PosAddressManagementPage/
│   └── index.js
│
├── index.js
└── README.md
```

---

# 4. Layer responsibilities

## `pages/`

Route-level orchestration.

Page chịu trách nhiệm kết nối:

```text
hooks
+
components
+
navigation
+
modal state
+
user feedback
```

Page không nên chứa HTTP implementation chi tiết.

---

## `hooks/`

Chịu trách nhiệm:

```text
feature state
fetching
mutation
loading state
error state
business flow
derived state
```

Hook không chịu trách nhiệm presentation.

---

## `api/`

Chứa backend contracts thuộc Address Management.

Ví dụ:

```text
fetch addresses
create address
update address
deactivate address
assign agency
assign POS
update shipping fee
```

UI component không gọi HTTP trực tiếp.

---

## `components/`

Chịu trách nhiệm:

```text
presentation
form interaction
table interaction
modal interaction
```

Component không tự quản lý backend lifecycle nếu responsibility đó thuộc page/hook.

---

## `constants/`

Chứa static domain configuration.

Ví dụ:

```text
address types
payment options
```

Không hard-code các option này lặp lại trong nhiều component.

---

# 5. Dependency direction

Architecture mục tiêu:

```text
app
 ↓
features
 ↓
shared
```

Trong Address Management:

```text
Page
 ↓
Hooks
 ↓
Feature API / Shared API
 ↓
Backend
```

Presentation:

```text
Page
 ↓
Components
```

Không tạo dependency ngược:

```text
shared
 ↓
address-management
```

`shared` không được import code từ feature Address.

---

# 6. AddressManagementPage

Location:

```text
src/features/address-management/pages/AddressManagementPage/
```

Route:

```text
/manager-address
```

`AddressManagementPage` là orchestration layer của màn quản lý địa chỉ.

Page chịu trách nhiệm điều phối:

```text
address list
search
refresh
create modal
edit modal
deactivate confirmation
order information modal
POS assignment modal
toast feedback
```

Page không trực tiếp chứa implementation HTTP.

---

# 7. Managed address list

Hook:

```text
useManagedAddresses
```

Hook chịu trách nhiệm:

```text
fetch addresses
loading state
error state
search
refresh
local remove
local replace
stale request protection
```

Search có thể dựa trên các dữ liệu như:

```text
địa chỉ
đơn vị
đại lý liên quan
```

Logic search không nên bị duplicate trong table component.

---

# 8. Address mutations

Hook:

```text
useAddressMutations
```

Chịu trách nhiệm cho:

```text
create
update
deactivate
```

Mutation state nên được giữ tập trung để UI xác định record nào đang được xử lý.

Frontend sử dụng khái niệm:

```text
deactivate
```

thay vì mặc định coi thao tác này là hard delete.

---

# 9. Managed Address API

File:

```text
api/addresses.api.js
```

Backend contracts hiện tại gồm các flow:

```text
GET
address/address-details?managerPhone=...

POST
address/create

PUT
address/:addressId/update

PUT
address/:addressId/deactivate
```

Address type hiện tại:

```text
NORMAL
SPECIAL
```

Frontend có thể làm việc với:

```text
addressName
```

trong khi backend create/update contract có thể sử dụng:

```text
name
```

Việc mapping field nên nằm trong API/data boundary thay vì rải trong UI component.

---

# 10. Address types

Được định nghĩa tập trung trong:

```text
constants/addressOptions.js
```

Các type hiện tại:

```text
NORMAL  → Bình thường
SPECIAL → Đặc biệt
```

Component không nên hard-code lại các label này.

---

# 11. Agency assignment

Hook:

```text
useAddressAgencyAssignment
```

API:

```text
api/agencyAddresses.api.js
```

Feature hỗ trợ hai flow chính.

### Address chưa có agency

```text
Address
 ↓
Assign agency
```

### Address đã có agency

```text
Address
 ↓
Edit order information
```

Backend contracts hiện tại gồm:

```text
POST
agency-address/assign

PUT
agency-address/change-info
```

Thông tin cấu hình order gồm:

```text
agency
receiver name
receiver phone
payment type
receive time
note
```

---

# 12. AddressOrderInfoModal

Component:

```text
components/AddressOrderInfoModal/
```

Đây là modal cấu hình thông tin đặt hàng của một địa chỉ.

UI hiện được chia thành các cấp rõ ràng:

```text
Address summary

Đại lý

Thông tin người nhận

Thiết lập đơn hàng
├── Phương thức thanh toán
├── Giờ nhận
└── Ghi chú
```

Address summary chỉ đóng vai trò context, không phải editable section.

Hierarchy của address summary:

```text
Địa chỉ giao hàng
Địa chỉ chính
Đơn vị / thông tin phụ
```

Ví dụ:

```text
Địa chỉ giao hàng
Số 3 Nguyễn Như Uyên, Yên Hoà, Cầu Giấy, Hà Nội
CHUNG CƯ 113
```

Không render label và value thành một chuỗi:

```text
Địa chỉ giao hàngSố 3 Nguyễn Như Uyên...
```

---

# 13. Address modal typography

Typography của modal phải giữ nhất quán.

Baseline hiện tại:

```text
Section title       14px / 700
Field label         13px / 650
Field value         14px / 500

Address label       12px / 600
Address chính       14px / 700
Address phụ         13px / 500

Helper / validation 11px
```

Custom controls phải tuân theo scale này.

Không tự định nghĩa:

```text
Input          14px
AgencySelect   16px
TimePicker     16px
Select         13px
```

trong cùng một form.

Các field chính giữ density khoảng:

```text
height: 44px
border-radius: 10px
```

---

# 14. AgencySelect

Location:

```text
AddressOrderInfoModal/AgencySelect/
```

`AgencySelect` là custom selector thuộc Address Management.

Behavior:

```text
Closed state
 ↓
Hiển thị agency hiện tại

Open state
 ↓
Search input
 ↓
Agency list
```

Search hỗ trợ:

```text
tên đại lý
số điện thoại
```

Search input nằm bên trong dropdown.

Field bên ngoài chỉ có nhiệm vụ hiển thị selection hiện tại.

Lý do:

```text
closed state = xem lựa chọn hiện tại
open state   = tìm và thay đổi lựa chọn
```

Hai task được phân biệt rõ ràng.

---

## AgencySelect ownership

`AgencySelect` hiện chỉ phục vụ Address Management.

Do đó component vẫn nằm tại:

```text
features/address-management/
```

không promote lên:

```text
shared/
```

Rule:

> Shared is earned.

Chỉ chuyển component vào `shared` khi feature thứ hai thực sự cần cùng abstraction.

---

# 15. ExactTimePicker

Location:

```text
AddressOrderInfoModal/ExactTimePicker/
```

Đây là time picker chính xác.

Nó không phải time-slot selector.

User có thể chọn:

```text
11:05
11:10
11:37
16:43
23:59
```

Không có rule UI ép người dùng theo:

```text
5 phút
10 phút
15 phút
30 phút
```

---

## ExactTimePicker interaction

User có hai cách nhập.

### Cách 1 — nhập trực tiếp

```text
HH:mm
```

Ví dụ:

```text
11:05
```

### Cách 2 — chọn giờ và phút

```text
Giờ    Phút

10      04
[11]   [05]
12      06
```

Hour và minute là hai phần độc lập.

---

## Time normalization

Một số input thuận tiện có thể được normalize:

```text
9:5   → 09:05
905   → 09:05
1105  → 11:05
```

UI sử dụng:

```text
HH:mm
```

Backend contract hiện tại vẫn sử dụng:

```text
HH:mm:ss
```

Ví dụ:

```text
11:05
 ↓
11:05:00
```

Phase UI hiện tại không thay đổi backend contract.

---

# 16. Payment types

Payment options được giữ tập trung trong:

```text
constants/addressOptions.js
```

Các value hiện tại:

```text
CASH
CUSTOMER_TRANSFER
AGENCY_TRANSFER
LATER
```

UI labels:

```text
CASH
→ Tiền mặt

CUSTOMER_TRANSFER
→ Khách hàng chuyển khoản

AGENCY_TRANSFER
→ Đại lý chuyển khoản

LATER
→ Trả sau
```

Không hard-code payment label trực tiếp trong modal.

---

# 17. AddressPosAssignmentModal

Component:

```text
AddressPosAssignmentModal
```

Hook:

```text
useAddressPosAssignment
```

API flow:

```text
assignAddressToPos
```

Backend contract hiện tại:

```text
POST
pos-agency/assign
```

Payload có dạng:

```text
posId

agencyAddressFee
├── agencyAddressId
└── feeShip
```

UI không trực tiếp thực hiện HTTP request.

---

# 18. PosAddressManagementPage

Location:

```text
src/features/address-management/pages/PosAddressManagementPage/
```

Route:

```text
/manage-pos-address
```

Page cho phép manager:

```text
chọn trung tâm
xem địa chỉ của trung tâm
search
refresh
update shipping fee
deactivate assignment
copy order link
```

---

## POS switching rule

Khi đổi POS, state presentation thuộc POS cũ phải được reset.

Ví dụ:

```text
POS A

đang mở fee modal
        ↓

chuyển POS B
        ↓

fee modal của POS A phải đóng
```

Không giữ stale UI state giữa hai POS.

---

# 19. usePosAddresses

Hook:

```text
usePosAddresses
```

Chịu trách nhiệm cho:

```text
kitchen selection
address fetching
search
loading
error
refresh
shipping-fee mutation
deactivate mutation
local address state
```

Các responsibility này không chuyển xuống `PosAddressTable`.

---

# 20. POS Address API

File:

```text
api/posAddresses.api.js
```

Các contracts hiện tại:

```text
POST
pos-agency/assign

GET
pos-agency/get-list-address/:posId

PUT
pos-agency/update-feeship/:posAgencyId

PUT
pos-agency/deactivate/:posAgencyId
```

---

# 21. POS Address presentation

Presentation components chính:

```text
PosAddressTable
PosAddressFeeModal
```

`PosAddressTable` chịu trách nhiệm hiển thị dữ liệu và expose user actions.

Nó không sở hữu backend mutation.

Các action như:

```text
Cập nhật phí giao hàng
Ngừng sử dụng
Sao chép link
```

được orchestration bởi page/hook phù hợp.

---

# 22. Order link

POS Address page hỗ trợ copy:

```text
orderLink
```

UI chỉ cho phép copy khi link tồn tại.

Success/error feedback nên sử dụng application toast.

Không sử dụng:

```js
alert(...)
```

cho interaction bình thường nếu project đã có feedback component phù hợp.

---

# 23. Shared dependencies

Address Management có thể sử dụng các shared capabilities như:

```text
src/shared/api/manager.api.js
src/shared/hooks/useKitchens
src/shared/components/ManagementPageHeader
src/shared/components/ManagementFormModal
src/shared/components/ConfirmModal
src/shared/components/AppToast
src/shared/utils/userInputValidation
src/shared/utils/getErrorDescription
```

Không duplicate các abstraction dùng chung này bên trong feature.

Ngược lại, các component mang meaning riêng của Address:

```text
AgencySelect
ExactTimePicker
AddressOrderInfoModal
AddressPosAssignmentModal
```

vẫn thuộc feature.

---

# 24. UI / UX principles

## Information hierarchy

Không trình bày modal thành một form phẳng dài.

Các field có cùng mục đích được nhóm thành section.

```text
Đại lý

Thông tin người nhận

Thiết lập đơn hàng
```

Visual separation chỉ cần nhẹ:

```text
border
soft header background
spacing
```

Không cần shadow/card nặng cho từng section.

---

## Address summary

Address summary là context block.

Không phải form section.

Hierarchy:

```text
label
↓
primary address
↓
secondary information
```

Primary address luôn nổi bật hơn unit / secondary metadata.

---

## Form density

Modal desktop giữ density vừa phải.

Baseline:

```text
control height   44px
value font       14px
label font       13px
section title    14px
radius           ~10px
```

Không dùng typography lớn chỉ vì component là custom component.

---

## View mode

Nếu address đã có configuration:

```text
open modal
   ↓
view mode
```

User bấm:

```text
Chỉnh sửa
```

mới chuyển sang:

```text
edit mode
```

Disabled state phải vẫn đọc rõ dữ liệu.

Không giảm contrast quá mạnh.

---

## Edit cancellation

Nếu record đã tồn tại và user đang edit:

```text
Hủy chỉnh sửa
```

phải:

```text
reset form
+
quay lại view mode
```

không đóng modal ngay.

---

## Destructive actions

Các action như:

```text
deactivate address
deactivate POS/address assignment
```

phải có confirmation.

Không sử dụng native:

```js
window.confirm(...)
```

nếu project đã có shared confirmation modal.

---

# 25. Search responsibilities

Feature có nhiều loại search khác nhau.

## Address list search

Dùng để lọc record trong màn quản lý địa chỉ.

---

## Agency search

Nằm bên trong:

```text
AgencySelect
```

Search theo:

```text
agency name
phone number
```

Hai search này là hai responsibility khác nhau.

Không dùng chung state chỉ vì cùng tên là `search`.

---

# 26. Error handling

Data/API layer trả lỗi lên layer orchestration.

Flow:

```text
API
 ↓
hook
 ↓
page
 ↓
toast / UI feedback
```

API layer không tự render toast.

Component presentation không cần hiểu HTTP implementation.

---

# 27. Loading states

Loading state nên thuộc request owner.

Ví dụ:

```text
address fetch
address update
address deactivate
agency assignment
shipping fee update
```

không nhất thiết dùng chung một boolean toàn feature nếu lifecycle khác nhau.

UI cần disable đúng interaction đang chạy, không khóa toàn màn hình nếu không cần thiết.

---

# 28. Refresh behavior

Sau mutation, page/hook có thể refresh data để đảm bảo UI đồng bộ với backend.

Phải phân biệt hai trường hợp.

### Mutation thất bại

```text
mutation
  ❌
```

User action thực sự chưa hoàn thành.

---

### Mutation thành công nhưng refresh thất bại

```text
mutation
  ✅

refresh
  ❌
```

Không được báo:

```text
"Cập nhật thất bại"
```

nếu backend đã lưu thành công.

Đây là hai failure mode khác nhau.

---

# 29. Things intentionally deferred

Phase Address Management hiện tại tập trung vào:

```text
frontend architecture
UI / UX
feature boundary
component structure
basic state ownership
legacy migration
documentation
```

Các vấn đề runtime/data architecture sâu hơn được để sang phase sau:

```text
request caching
request deduplication
latency strategy
optimistic updates
server-state architecture
realtime synchronization
WebSocket
FCM synchronization
retry strategy
offline behavior
race conditions toàn hệ thống
backend contract redesign
API normalization toàn project
performance profiling
```

Không mở lại UI phase chỉ để xử lý các vấn đề trên.

Khi bắt đầu phase:

```text
Data / Runtime Architecture
```

feature này có thể được audit lại ở các layer:

```text
API
hooks
cache
realtime
performance
```

nhưng visual/UI baseline được xem là hoàn thành.

---

# 30. What Address Management does not own

Feature này không sở hữu:

```text
POS creation/editing
user account CRUD
authentication
order execution workflow
kitchen menu management
global navigation
global realtime architecture
generic reusable form primitives
```

Ví dụ:

```text
Quản lý POS
```

thuộc feature POS tương ứng.

User/account management thuộc:

```text
user-management
```

Orders thuộc:

```text
orders
```

Address Management chỉ giữ những responsibility có ý nghĩa trực tiếp với domain Address.

---

# 31. Shared rule

Không chuyển component vào `shared` chỉ vì:

> "sau này có thể cần."

Rule:

> Shared is earned.

Component chỉ được promote lên shared khi:

1. feature thứ hai thực sự cần;
2. abstraction giữa hai use case thực sự giống nhau;
3. API component có thể tồn tại mà không mang business language của Address.

Ví dụ hiện tại:

```text
AgencySelect
ExactTimePicker
```

chưa cần promote.

---

# 32. Legacy rule

Khi migrate legacy code:

```text
find consumer
 ↓
move responsibility
 ↓
update imports
 ↓
verify
 ↓
remove legacy
```

Không xóa folder chỉ vì tên của nó trông cũ.

Không tạo thêm:

```text
components_new
components_v2
final
new_final
```

để né migration.

---

# 33. Documentation rule

Bất kỳ thay đổi architecture đáng kể nào trong feature phải cập nhật:

```text
README.md
```

trong cùng step/commit.

Không để documentation thành công việc làm sau cùng rồi quên.

---

# 34. Completion checklist

Frontend/UI migration của Address Management:

```text
Feature boundary                 ✅
Feature API                      ✅
Hooks                            ✅

Address management page          ✅
POS address page                 ✅

Address table                    ✅
Address create/edit modal        ✅
Address deactivate flow          ✅

Agency assignment                ✅
Address order information modal  ✅
Agency searchable selector       ✅
Exact minute time picker         ✅

POS assignment                   ✅
POS address table                ✅
Shipping fee modal               ✅
Order link copy                  ✅

Search states                    ✅
Loading states                   ✅
Error states                     ✅
Empty states                     ✅

Form hierarchy                   ✅
Address information hierarchy    ✅
Typography consistency           ✅
Responsive baseline              ✅

Route migration                  ✅
Legacy cleanup for this feature  ✅
Feature documentation            ✅
```

---

# 35. Final architecture

```text
AddressManagementPage
│
├── useManagedAddresses
│       ↓
│   addresses.api
│
├── useAddressMutations
│       ↓
│   addresses.api
│
├── useAddressAgencies
│       ↓
│   shared manager API
│
├── useAddressAgencyAssignment
│       ↓
│   agencyAddresses.api
│
├── useAddressPosAssignment
│       ↓
│   posAddresses.api
│
├── AddressManagementTable
│
├── AddressFormModal
│
├── AddressOrderInfoModal
│       ├── AgencySelect
│       └── ExactTimePicker
│
└── AddressPosAssignmentModal
```

POS Address flow:

```text
PosAddressManagementPage
│
├── usePosAddresses
│       ↓
│   posAddresses.api
│
├── PosAddressTable
│
└── PosAddressFeeModal
```

Overall dependency:

```text
app
 ↓
features/address-management
 ↓
shared
```

---

# 36. Rules for future changes

Nếu sửa feature này trong tương lai:

1. Không đưa HTTP logic trở lại component.
2. Không duplicate API contracts trong page.
3. Không hard-code payment/address options trong component.
4. Không đưa component vào `shared` trước khi có reuse thực tế.
5. Không biến `ExactTimePicker` thành fixed time-slot picker nếu business không yêu cầu.
6. Không duplicate agency search logic ngoài `AgencySelect`.
7. Không sửa backend contract từ presentation component.
8. Không phá typography/density đã thống nhất trong modal.
9. Không tạo thêm legacy/v2/new folder để né migration.
10. Architecture thay đổi thì README phải thay đổi cùng commit.
11. Backend/data optimization thuộc phase Data / Runtime Architecture.
12. UI chỉ mở lại khi có requirement mới hoặc regression thực sự.

---

# 37. Phase status

```text
ADDRESS MANAGEMENT

UI / FRONTEND REFACTOR

✅ CLOSED
```

Address Management hiện được xem là hoàn thành ở phase frontend/UI.

Không tiếp tục polish feature này nếu không có:

```text
bug
regression
requirement mới
```

Các vấn đề về:

```text
backend
cache
latency
realtime
optimistic updates
request lifecycle
performance
```

được chuyển sang phase Data / Runtime Architecture sau khi frontend migration hoàn tất.

---

# 38. Next phase

Sau khi đóng Address Management, frontend refactor tiếp tục với feature kế tiếp.

Current roadmap:

```text
Address Management
✅ CLOSED

↓

Request Rate / Đảm bảo chất lượng
NEXT
```

Quy trình cho feature tiếp theo:

```text
1. Audit code hiện tại
2. Xác định runtime consumer
3. Xác định legacy code
4. Xác định feature boundary
5. Chốt UI / UX
6. Migrate page
7. Migrate components
8. Migrate hooks / frontend logic cần thiết
9. Switch route
10. Cleanup legacy
11. Verify
12. README
13. Close phase
```

Không refactor backend/runtime architecture sâu trong phase này.
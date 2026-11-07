# Order Summary

Feature **Tổng hợp đơn hàng** của Freshy Web Manager.

Route:

```text
/manager-order-summary
```

Mục tiêu của feature:

- xem danh sách đơn hàng đã hoàn thành;
- lọc dữ liệu theo bếp đang chọn;
- xem chi tiết đơn ở chế độ read-only;
- xuất báo cáo Excel theo ngày / khoảng ngày / đơn vị;
- giữ table và export cùng một kitchen context.

---

## 1. Sidebar

Icon đề xuất cho menu **Tổng hợp đơn hàng**:

```js
FileDoneOutlined
```

Import từ Ant Design Icons:

```js
import {
  FileDoneOutlined,
} from "@ant-design/icons";
```

Lý do chọn:

- phân biệt rõ với `ShoppingCartOutlined` của **Danh sách đơn hàng**;
- phân biệt với `BarChartOutlined` của **Doanh số bán hàng**;
- phù hợp với ý nghĩa báo cáo / danh sách đơn đã hoàn thành;
- đồng bộ style outline đang dùng ở sidebar.

Ví dụ navigation item:

```js
{
  key: "manager-order-summary",
  label: "Tổng hợp đơn hàng",
  path: "/manager-order-summary",
  icon: <FileDoneOutlined />,
}
```

---

## 2. Feature structure

```text
src/features/order-summary/
├── api/
│   ├── index.js
│   └── orderSummary.api.js
│
├── components/
│   ├── ExportOrdersModal/
│   │   ├── index.js
│   │   └── ExportOrdersModal.scss
│   │
│   ├── OrderSummaryDetail/
│   │   ├── index.js
│   │   └── OrderSummaryDetail.scss
│   │
│   ├── OrderSummaryHeader/
│   │   ├── index.js
│   │   └── OrderSummaryHeader.scss
│   │
│   ├── OrderSummaryRequestCard/
│   │   ├── index.js
│   │   └── OrderSummaryRequestCard.scss
│   │
│   ├── OrderSummaryTable/
│   │   ├── index.js
│   │   └── OrderSummaryTable.scss
│   │
│   └── index.js
│
├── hooks/
│   ├── index.js
│   ├── useOrderSummary.js
│   └── useOrderSummaryExport.js
│
├── pages/
│   └── OrderSummaryPage/
│       ├── index.js
│       └── OrderSummaryPage.scss
│
└── README.md
```

Không tạo `constants/` hoặc `utils/` khi chưa có nhu cầu thực tế.

---

## 3. Architecture

```text
/manager-order-summary
        ↓
OrderSummaryPage
        │
        ├── shared/useKitchens
        │
        ├── useOrderSummary
        │       ↓
        │   order-summary/api
        │
        ├── useOrderSummaryExport
        │       ↓
        │   order-summary/api
        │
        ├── OrderSummaryHeader
        ├── OrderSummaryTable
        ├── OrderSummaryDetail
        │       ↓
        │   OrderSummaryRequestCard
        │
        └── ExportOrdersModal
```

Nguyên tắc:

> Page điều phối. Hook sở hữu state/async/business flow. Component sở hữu presentation. API sở hữu backend contract.

Feature không phụ thuộc presentation component của `orders`.

---

## 4. Kitchen source of truth

Feature chỉ có một kitchen source of truth:

```text
selectedKitchenId
```

được cung cấp bởi:

```text
src/shared/hooks/useKitchens
```

Flow:

```text
selectedKitchenId
├── useOrderSummary
│      ↓
│   report table
│
└── useOrderSummaryExport
       ↓
    Excel export
```

Vì vậy table và export luôn dùng cùng một bếp.

Không giữ các state legacy:

```text
posIds
selectedKitchen object
{ posId, posName }
{ value, label }
```

---

## 5. Report API contract

Backend endpoint:

```text
GET /orders/status
```

`posId` là **một Long duy nhất**.

Đúng:

```text
?posId=1&status=FINISHED&page=0&size=10
```

Sai:

```text
?posId=1,2
```

Frontend contract:

```js
getOrdersSummaryByStatus(
  status,
  posId,
  page,
  size,
)
```

Hook:

```js
useOrderSummary({
  status: "FINISHED",
  posId: selectedKitchenId,
  pageSize: 10,
})
```

Không dùng `posIds.join(",")`.

---

## 6. `useOrderSummary`

Hook sở hữu:

```text
orders
loading
loadingMore
error
hasMore
loadMore
refresh
```

Ngoài ra xử lý:

- stale response protection;
- pagination;
- duplicate order protection theo `orderId`;
- reset data khi kitchen thay đổi;
- chặn request pagination chạy đồng thời.

UI không trực tiếp gọi report API.

---

## 7. `useOrderSummaryExport`

Hook sở hữu:

```text
units
loadingUnits
unitsError
exporting
exportError
refreshUnits
exportOrders
```

Export decision matrix:

```text
all + date
  → exportAllOrdersByDate

all + range-date
  → exportAllOrdersByDateRange

unit + date
  → exportOrdersByUnitAndDate

unit + range-date
  → exportOrdersByUnitAndDateRange
```

Modal không biết endpoint cụ thể.

Hook cũng xử lý:

- stale unit request;
- duplicate export protection;
- export loading state.

---

## 8. Page responsibilities

`OrderSummaryPage` sở hữu:

```text
auth context
selected kitchen context
report hook
export hook
detail open/close
export modal open/close
notifications
component composition
```

Page không sở hữu:

```text
API endpoint details
table columns
pagination internals
export decision matrix
detail presentation
```

Khi đổi kitchen:

```text
selectedOrder
→ reset
```

để detail của bếp cũ không còn mở sau khi context thay đổi.

---

## 9. Header

`OrderSummaryHeader` hiển thị:

```text
Tổng hợp đơn hàng
[Bếp đang chọn]
[Xuất Excel]
```

Thứ tự:

```text
Kitchen context
→ Export action
```

Kitchen là context của report nên đứng trước action export.

UI dùng brand:

- brown primary;
- cream / neutral surface;
- brown hover/focus;
- không dùng blue interaction mặc định của Ant Design.

---

## 10. Table behavior

`OrderSummaryTable` hiển thị:

```text
STT
Đơn vị
Địa chỉ
Số điện thoại khách hàng
Ngày đặt hàng
Số yêu cầu
```

Không có cột:

```text
Hành động
```

Toàn bộ row là clickable:

```text
click row
→ mở OrderSummaryDetail
```

Pattern này đồng nhất với bảng Orders.

### Customer phone

Cột:

```text
Số điện thoại khách hàng
```

dùng field:

```js
agencyOrderPhone
```

Không dùng:

```js
agencyPhone
```

### Order date

Ngày đặt hàng chỉ hiển thị:

```text
DD/MM/YYYY
```

Ví dụ:

```text
10/10/2026
```

Không hiển thị giờ.

### Scrolling

Workspace:

```text
page header             fixed
table section header    fixed
column header           fixed
rows                    scroll
```

Chỉ phần rows scroll theo chiều dọc.

Infinite scroll dùng threshold gần đáy thay vì kiểm tra exact equality.

---

## 11. Read-only detail

`OrderSummaryDetail` chỉ nhận:

```text
open
order
onClose
```

Không có mutation contract:

```text
onConfirm
onCancel
onFinish
onOrderUpdated
actionLoading
```

Detail không có:

- chỉnh sửa;
- hủy đơn;
- hủy yêu cầu;
- xác nhận;
- hoàn thành;
- order mutation API.

`OrderSummaryRequestCard` hiển thị:

- request ID;
- copy request ID;
- ngày;
- payment status;
- tổng tiền;
- khách hàng;
- số điện thoại;
- đơn vị / địa chỉ;
- item;
- quantity;
- topping;
- item note;
- request note.

Copy ID là thao tác local, không phải business mutation.

---

## 12. Export modal

`ExportOrdersModal` là presentation-only.

Props chính:

```text
open
kitchenName
units
loadingUnits
exporting
onClose
onExport
```

Modal hiển thị rõ kitchen đang export.

Mặc định:

```text
unit = ALL
```

Hỗ trợ:

```text
Theo ngày
Theo khoảng ngày
Tất cả đơn vị
Theo từng đơn vị
```

Trong lúc export:

```text
submit loading
cancel disabled
close disabled
mask close disabled
keyboard close disabled
```

---

## 13. Global loading integration

Loading toàn web được custom ở:

```text
src/styles/global.scss
```

Design:

```text
favicon ở giữa
+
vòng brand brown / gold xoay bên ngoài
```

Không hiển thị loading text ở các màn chỉ cần trạng thái chờ.

Favicon dùng cho SCSS nên được đặt trong asset mà webpack resolve được, ví dụ:

```text
src/assets/favicon.ico
```

và reference:

```scss
url("../assets/favicon.ico")
```

`public/favicon.ico` vẫn giữ cho browser tab.

---

## 14. Legacy cleanup

Implementation cũ đã được loại bỏ sau khi route mới được verify.

Legacy targets:

```text
src/pages/OrderSummaryManage/
src/components/OrderSummaryList/
src/components_new/export_excel/ExportExcelModal.js
```

Report API/export ownership không còn nằm trong generic legacy services.

Feature runtime hiện chỉ đi qua:

```text
src/features/order-summary/
```

---

## 15. Route

Route giữ nguyên:

```text
/manager-order-summary
```

Runtime:

```text
/manager-order-summary
  ↓
OrderSummaryPage
```

Không dùng `OrderSummaryManage` legacy.

---

## 16. UI principles

Feature tuân theo visual language chung của Freshy Web Manager:

```text
brown / gold / cream
neutral white surfaces
compact admin density
restrained borders/shadows
clear information hierarchy
no generic Ant Design blue states
```

Không thêm KPI/dashboard card nếu không phục vụ trực tiếp workflow của report.

---

## 17. Verification checklist

```text
[ ] /manager-order-summary mở đúng page mới

[ ] Sidebar có FileDoneOutlined
[ ] Sidebar collapsed chỉ hiện icon đúng

[ ] Kitchen mặc định được chọn
[ ] Đổi kitchen reload đúng table
[ ] Table và export dùng cùng selectedKitchenId

[ ] Request gửi posId đơn lẻ
[ ] Không còn posId=1,2

[ ] Table không có cột Hành động
[ ] Click row mở detail

[ ] Số điện thoại khách hàng dùng agencyOrderPhone
[ ] Ngày đặt hàng chỉ DD/MM/YYYY

[ ] Table header cố định
[ ] Chỉ rows scroll
[ ] Infinite scroll load thêm đúng
[ ] Không duplicate order

[ ] Detail read-only
[ ] Không có edit/cancel/confirm/finish

[ ] Export modal hiện đúng kitchen
[ ] ALL + date hoạt động
[ ] ALL + date range hoạt động
[ ] unit + date hoạt động
[ ] unit + date range hoạt động
[ ] Không double export

[ ] Loading dùng favicon + brown rotating ring
[ ] Không còn loading text không cần thiết

[ ] npm run build thành công
```

---

## 18. Migration status

```text
Step 1  Audit + feature boundary          DONE
Step 2  API ownership                     DONE
Step 3  useOrderSummary                   DONE
Step 4  Export hook                       DONE
Step 5  Presentation components           DONE
Step 6  Read-only detail                  DONE
Step 7  OrderSummaryPage                  DONE
Step 8  Route switch                      DONE
Step 9  Legacy cleanup                    DONE
Step 10 UI/UX redesign                    DONE
```

Order Summary feature is now feature-owned, read-only, kitchen-scoped, export-capable and aligned with the current Freshy Web Manager UI system.

## Detail on demand

Xem ../../../docs/refactor/order-summary/detail-on-demand.md.

## Order detail visual redesign

Tối ưu giao diện Chi tiết đơn hàng, giữ nguyên API và loading/retry. Xem docs/refactor/order-summary/detail-modal-ui.md.

# Sales Feature

Feature `sales` quản lý màn **Doanh số bán hàng** theo ca của từng bếp / POS.

```text
src/features/sales/
```

Route hiện tại vẫn giữ URL cũ:

```text
/order-summary
```

Nhưng implementation thuộc feature mới:

```text
src/features/sales/pages/SalesSummaryPage/
```

README này mô tả trạng thái feature sau khi hoàn thành migration kiến trúc và UI/UX redesign.

---

## 1. Phạm vi của Sales

Sales chịu trách nhiệm:

- chọn bếp / POS;
- tải shift summary;
- hiển thị KPI của ca hiện tại;
- hiển thị chi tiết sản lượng từng món;
- chỉnh sửa định lượng ban đầu;
- refresh dữ liệu sau mutation;
- quản lý loading / error;
- cung cấp UI vận hành cố định, dễ scan.

Sales không phải màn:

```text
Tổng hợp đơn hàng
```

`/manager-order-summary` là một nghiệp vụ/report khác và không thuộc feature này.

---

## 2. Feature boundary

Cấu trúc:

```text
src/features/sales/
├── api/
├── components/
├── hooks/
├── pages/
└── README.md
```

Trách nhiệm:

```text
api/
  Request liên quan shift summary và initial quantity.

hooks/
  Data fetching và mutation logic.

components/
  UI riêng của Sales.

pages/
  Orchestration của route Sales.
```

---

## 3. Page chính

Entry point:

```text
src/features/sales/pages/SalesSummaryPage/
```

Cấu trúc runtime:

```text
SalesSummaryPage
├── SalesPageHeader
├── SalesSummaryStats
├── SalesItemsTable
└── EditInitialQuantityModal
```

Data dependencies:

```text
UserAuth
   ↓
shared/useKitchens
   ↓
selectedKitchenId
   ↓
useShiftSummary
   ↓
shiftSummary
```

Mutation:

```text
EditInitialQuantityModal
   ↓
SalesSummaryPage
   ↓
useShiftItemQuantityUpdate
   ↓
Sales API
   ↓
refreshSummary
```

---

## 4. API ownership

Sales API thuộc:

```text
src/features/sales/api/
```

Các operation chính:

```text
getShiftSummary(posId)

updateShiftItemsQuantity(
  posId,
  updateShiftItems
)
```

Feature code mới không nên gọi mutation Sales qua legacy service aggregator.

Một compatibility bridge cho `getShiftSummary` có thể vẫn tồn tại ở legacy service vì module cũ khác còn sử dụng nó. Không được hiểu bridge đó là owner mới của Sales API.

---

## 5. Shared kitchen selection

Sales sử dụng:

```text
src/shared/hooks/useKitchens
```

Hook cung cấp:

```text
kitchens
selectedKitchenId
selectedKitchen
posIds
posName
loading
error
handleKitchenSelect
```

Khi danh sách kitchen tải xong, UI phải hiển thị kitchen được chọn thay vì để placeholder nếu đã có giá trị hợp lệ.

Không duplicate logic `getPosInfo` trực tiếp trong `SalesSummaryPage`.

---

## 6. `useShiftSummary`

Hook chịu trách nhiệm:

- fetch summary theo `posId`;
- reset dữ liệu khi không có POS;
- quản lý loading/error;
- expose `refresh`;
- chống stale response khi user đổi kitchen nhanh.

Public shape:

```text
shiftSummary
loading
error
refresh
```

Page chịu trách nhiệm hiển thị notification.

---

## 7. `useShiftItemQuantityUpdate`

Hook mutation chịu trách nhiệm:

- build payload từ edit items;
- gọi Sales API;
- quản lý updating/error;
- refresh summary sau khi mutation thành công.

UI không cần biết format request backend chi tiết.

---

## 8. Sales page states

Page có các state chính:

```text
Loading kitchens / summary
No kitchen
No open shift / no data
Loaded
Error
```

Error được thông báo ở page layer.

Khi chưa có dữ liệu ca, không render KPI/table giả.

---

## 9. Header

`SalesPageHeader` hiển thị:

```text
Doanh số bán hàng
Chỉnh sửa định lượng
Kitchen selector
```

Interaction language đồng bộ với Orders.

Button `Chỉnh sửa định lượng`:

```text
normal   → nền nâu brand
hover    → nâu đậm hơn
focus    → brown focus ring
active   → nâu đậm
disabled → neutral gray
```

Ant Design blue states phải được override.

Kitchen select cũng sử dụng brown/gold hover, focus và selected states.

---

## 10. KPI summary

`SalesSummaryStats` hiển thị 3 metric chính:

```text
Đơn hàng
Sản lượng bán
Doanh thu
```

KPI được thiết kế compact.

Nguyên tắc:

- không chiếm quá nhiều chiều cao;
- dùng neutral card;
- hạn chế decoration;
- doanh thu có emphasis nhẹ;
- số dùng `tabular-nums`;
- brand color chỉ dùng có chủ đích.

KPI là summary, không phải hero section.

---

## 11. Sales table

`SalesItemsTable` là vùng làm việc chính.

Các cột:

```text
Tên món
Ban đầu
Đã bán
Tổng món
Topping
Còn lại
```

### Numeric readability

Các cột số:

- căn phải;
- dùng tabular numbers;
- format theo `vi-VN`;
- `Đã bán` dùng brown brand nhẹ;
- `Còn lại` có typography mạnh hơn;
- không biến mọi số thành badge.

### Remaining quantity

Không hiển thị:

```text
percentage
progress bar
```

ở cột `Còn lại`.

Lý do:

Số lượng thực tế có giá trị vận hành cao hơn phần trăm và dễ so sánh hơn trong bối cảnh bếp.

---

## 12. Fixed operational layout

Sales page được thiết kế như một workspace cố định.

```text
Page header            fixed
KPI cards              fixed
Table section header   fixed
Table column header    fixed
Table rows             scroll
```

Chỉ rows của table scroll theo chiều dọc.

Mục tiêu:

- luôn thấy kitchen đang chọn;
- luôn thấy action chỉnh định lượng;
- luôn thấy KPI;
- luôn thấy ý nghĩa từng cột;
- dành tối đa vùng còn lại cho dữ liệu.

Flex layout cần giữ:

```text
flex: 1 1 auto;
min-height: 0;
```

ở các ancestor cần thiết để scroll nằm trong table body thay vì đẩy toàn page.

---

## 13. Edit Initial Quantity Modal

Component:

```text
EditInitialQuantityModal
```

Modal được thiết kế cho bulk edit nhiều món.

Layout:

```text
Modal header         fixed
Info note            fixed
Table context        fixed
Table column header  fixed
Rows                 scroll
Footer                fixed
```

Chỉ danh sách row scroll.

---

## 14. Modal edit behavior

Khi modal mở, mỗi item giữ:

```text
quantity
originalQuantity
editableKey
```

`originalQuantity` và `editableKey` chỉ phục vụ UI.

Mutation hook vẫn build payload backend từ các field cần thiết.

Modal theo dõi:

```text
changedCount
hasChanges
```

Behavior:

```text
Không thay đổi
→ Save disabled

Có thay đổi
→ hiển thị số món đã thay đổi
→ Save enabled
```

Row đã chỉnh được highlight rất nhẹ.

Không dùng màu cảnh báo nếu không có semantic warning thật.

---

## 15. Numeric input

Input định lượng:

- chỉ cho số nguyên;
- `min = 0`;
- không hiển thị nút tăng/giảm;
- số căn phải;
- dùng tabular numbers;
- focus border/ring dùng brown brand;
- changed input có emphasis nhẹ.

Spinner được tắt bằng:

```text
controls={false}
```

và có CSS fallback cho Ant Design cũ.

---

## 16. Modal actions

Footer luôn nhìn thấy.

Actions:

```text
Hủy
Lưu thay đổi
```

Trong khi đang save:

- disable cancel/close cần thiết;
- không cho duplicate submit;
- giữ loading state trên Save.

Sau khi save thành công:

```text
API mutation
→ refresh summary
→ notification success
→ close modal
```

Nếu lỗi:

```text
notification error
→ modal vẫn giữ context để user xử lý lại
```

---

## 17. Visual language

Sales theo cùng design language với Orders:

```text
neutral white / cream surfaces
brown / gold brand accent
restrained shadow
compact spacing
clear typography
limited gradients
no decorative multi-color cards
```

Không dùng Ant Design blue làm interaction color.

Không thêm chart chỉ để lấp khoảng trống.

Chart chỉ nên xuất hiện khi backend cung cấp dữ liệu time-series hoặc breakdown thực sự có ý nghĩa.

---

## 18. Loading và empty state

Loading:

```text
kitchensLoading || summaryLoading
```

Empty states cần phân biệt:

```text
không có kitchen/POS
không có ca/dữ liệu
```

Không render số `0` giả như thể summary đã tải thành công khi thực tế chưa có ca.

---

## 19. Không nên làm

Không tạo:

```text
SalesV2
SalesFinal
components_new
newSales
```

Không:

- duplicate kitchen hook;
- gọi API trực tiếp từ presentation component;
- để modal tự fetch lại summary;
- thêm percentage/progress nếu không có business need;
- thêm chart từ dữ liệu snapshot;
- dùng nhiều màu trang trí;
- để toàn page scroll nếu table body có thể là vùng scroll riêng.

---

## 20. Shared rule

Hiện tại abstraction thực sự dùng chung giữa Orders và Sales là:

```text
shared/useKitchens
```

Đây là ví dụ đúng của:

> Shared is earned.

Các component khác vẫn nên ở feature cho tới khi có nhu cầu dùng chung thật sự.

---

## 21. Checklist trước khi commit

```text
[ ] Kitchen đầu tiên hiển thị đúng sau khi load
[ ] Đổi kitchen tải đúng summary
[ ] Stale request không overwrite kitchen mới
[ ] Loading state đúng
[ ] Empty state đúng
[ ] KPI compact và không chiếm quá nhiều chiều cao
[ ] Table header cố định
[ ] Chỉ table rows scroll
[ ] Numeric columns căn phải
[ ] Không còn % / progress ở Còn lại
[ ] Modal header cố định
[ ] Modal table header cố định
[ ] Chỉ modal rows scroll
[ ] Modal footer luôn thấy
[ ] Input không có spinner
[ ] Save disabled khi chưa thay đổi
[ ] Changed count đúng
[ ] Save refresh lại summary
[ ] Không có AntD blue state
[ ] Responsive không vỡ
[ ] Build thành công
```

---

## 22. Kiến trúc tóm tắt

```text
SalesSummaryPage
│
├── shared/useKitchens
│
├── useShiftSummary
│   └── getShiftSummary
│
├── useShiftItemQuantityUpdate
│   └── updateShiftItemsQuantity
│
├── SalesPageHeader
├── SalesSummaryStats
├── SalesItemsTable
└── EditInitialQuantityModal
```

Feature Sales hiện có boundary rõ ràng và không còn phụ thuộc vào legacy page để render route `/order-summary`.

Các thay đổi tiếp theo nên tập trung vào business capability mới hoặc regression fix, không tiếp tục thêm decoration chỉ để làm UI phức tạp hơn.

## Shift Inventory Editor migration

Frontend đang chuyển sang API journal-based.
Chi tiết: `docs/refactor/sales/step-shift-inventory-editor.md`.

API cũ `/shifts/{posId}/items/initial` đã bị backend khóa (HTTP 410).
Không deploy editor cũ để chỉnh tồn kho.

- Shift Inventory Editor bước 2: hook/modal dùng API journal,
  Idempotency-Key và audit reason.
  Xem docs/refactor/sales/step-shift-inventory-editor.md.

## Shift Inventory shared UI — bước 3

Modal mở ca và modal chỉnh tồn dùng chung `InventoryItemCards`. Xem `docs/refactor/sales/step-shift-inventory-editor.md`.

## Shift History — STT và ngày giờ

Bảng lịch sử ca bỏ tên ca, thêm STT và chuẩn hóa ngày giờ. Xem `docs/refactor/sales/step-shift-history-table.md`.

## Shift history detail redesign

Danh sách món chỉ còn Tên món / Ban đầu / Đã bán / Doanh thu.
Lịch sử chỉnh sửa được thiết kế lại, dùng nhãn tiếng Việt.
Doanh thu từng món đang chờ backend cung cấp.

Xem docs/refactor/sales/step-shift-history-detail-ui.md.

## Chỉnh tồn ca — menu membership

SalesSummaryPage không còn gọi `getKitchenMenus` để tìm `menuId` khi mở modal chỉnh tồn. Dữ liệu menu phải là snapshot lúc mở ca do backend trả về từ `/shifts/{shiftId}/inventory/edit`; selector giới hạn món cùng menu thuộc ca. Nếu backend chưa trả `menuIds`/`menuId` thì chỉ khóa chọn món trừ tồn, không khóa sửa định lượng. Backend PUT phải kiểm tra cùng rule.

Chi tiết: `docs/refactor/sales/step-inventory-menu-membership.md`.

## Điều khiển nhận đơn

Trang `Doanh số bán hàng` (tab `Ca hiện tại`) đặt `OrderAdmissionCard` ở phần vận hành.
Chỉ ADMIN/SUPER_ADMIN nhìn và gọi API `PUT /shifts/{posId}/ordering` cùng `expected shiftId`.
Pause ảnh hưởng **mọi request mới của POS**, không chỉ Web Order. Không hủy đơn cũ, không tự đóng ca.

#### Operational control — V4 compact bar

`OrderAdmissionCard` presents a concise status plus shift context and icon-only refresh; the single Pause/Resume action opens a centered `AppModal` confirmation instead of a floating Popconfirm. The `Ca hiện tại / Lịch sử ca` tabs already handle navigation; do not add redundant history shortcuts. Pause affects new Web Order **and** POS requests (not existing orders). Errors preserve the current confirmation dialog for review.

### V4 – Giao diện xác nhận Pause/Resume (patch tương thích)

`OrderAdmissionCard` ở trang Doanh số sử dụng status bar gọn và **AppModal** xác nhận
Pause/Resume thay cho `Popconfirm`. Nút trạng thái có nhãn ngắn `Tạm ngừng` / `Mở lại`,
refresh là nút icon có accessible label. Thay đổi chỉ ảnh hưởng FE: thao tác vẫn gọi
`onChange("PAUSED" | "ACCEPTING")` qua hook hiện có và giữ nguyên quy tắc BE.

Khi tích hợp trên một số bản V3 có `cancelText="Đóng"` (thay vì
`cancelText="Để sau"`), dùng bản `Freshy_V4_OrderAdmissionCard_Tailored.patch`
để thay riêng component; không apply lại patch V4 đầy đủ. Trước khi merge phải chạy
Jest/build và kiểm tra giao diện thật, không chỉ preview HTML.


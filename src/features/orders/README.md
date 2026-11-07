# Orders Feature

Feature `orders` quản lý toàn bộ luồng vận hành đơn hàng trong Web Manager.

```text
src/features/orders/
```

README này mô tả trạng thái kiến trúc hiện tại của feature sau quá trình refactor và UI/UX redesign.

---

## 1. Mục tiêu của feature

Orders chịu trách nhiệm cho:

- tải danh sách đơn hàng theo trạng thái;
- lọc đơn theo bếp / POS;
- tìm kiếm đơn hàng;
- hiển thị số lượng đơn theo từng tab;
- xem chi tiết đơn;
- xác nhận đơn;
- hoàn thành đơn;
- hủy đơn;
- chỉnh sửa đơn khi business rule cho phép;
- quản lý loading / error của các action;
- giữ UI đồng bộ với trạng thái backend.

Feature không nên sở hữu các thành phần generic của toàn ứng dụng nếu chúng không có ý nghĩa riêng với Orders.

---

## 2. Feature boundary

Cấu trúc mục tiêu:

```text
src/features/orders/
├── api/
├── components/
├── constants/
├── hooks/
├── pages/
├── utils/
└── README.md
```

Trách nhiệm:

```text
api/
  Giao tiếp backend liên quan tới order.

components/
  UI chỉ phục vụ domain Orders.

constants/
  Status, tabs và các cấu hình tĩnh của Orders.

hooks/
  Data fetching, action, filtering và logic state của feature.

pages/
  Orchestration layer của route Orders.

utils/
  Pure utilities và business rules nhỏ.
```

Nguyên tắc:

> Page điều phối. Hook xử lý logic. Component trình bày. API giao tiếp backend.

---

## 3. Page chính

Entry point của feature:

```text
src/features/orders/pages/OrdersPage/
```

`OrdersPage` chịu trách nhiệm kết nối các phần lớn:

```text
OrdersPage
├── OrderHeader
├── OrderStatusTabs
├── OrderTable
└── OrderDetail
```

Page không nên chứa lại logic chi tiết đã thuộc về hook hoặc component.

---

## 4. Trạng thái đơn hàng

Luồng trạng thái hiện tại:

```text
CHECKING
   ↓
MAKING
   ↓
WAITING
   ↓
SHIPPING
   ↓
FINISHED
```

Ngoài ra có:

```text
CANCELED
```

Các tab của Orders được định nghĩa tập trung trong constants thay vì hard-code trực tiếp trong page/component.

---

## 5. Business rule chỉnh sửa đơn

Rule hiện tại:

```text
CHECKING  → được chỉnh sửa
MAKING    → không chỉnh sửa
WAITING   → không chỉnh sửa
SHIPPING  → không chỉnh sửa
FINISHED  → không chỉnh sửa
CANCELED  → không chỉnh sửa
```

Lý do:

Sau khi đơn đã được xác nhận và chuyển sang quy trình xử lý, việc chỉnh sửa trực tiếp dữ liệu cũ có thể làm lệch trạng thái giữa Web Manager, bếp và dữ liệu vận hành.

Permission nên được kiểm tra qua business rule / utility thay vì chỉ ẩn nút bằng CSS.

Ví dụ:

```text
canEditOrder(status)
```

UI chỉ render action chỉnh sửa khi rule trả về `true`.

---

## 6. Kitchen / POS selection

Danh sách bếp được lấy từ context người dùng hiện tại.

Orders sử dụng shared kitchen abstraction:

```text
src/shared/hooks/useKitchens
```

Shared hook chịu trách nhiệm:

- tải danh sách POS;
- normalize thành `{ value, label }`;
- giữ kitchen đang chọn;
- cung cấp `posIds`;
- cung cấp handler đổi kitchen.

Orders chỉ quyết định tập `posIds` nào cần truyền vào query đơn hàng.

Kitchen filtering được thực hiện qua backend request thay vì tải toàn bộ rồi lọc lại ở frontend.

---

## 7. Data flow

Luồng dữ liệu chính:

```text
UserAuth
   ↓
useKitchens
   ↓
selected kitchen / activePosIds
   ↓
useOrders
   ↓
orders
   ↓
useOrderFilters
   ↓
filteredOrders
   ↓
OrderTable
```

Action flow:

```text
OrderDetail
   ↓
OrdersPage handler
   ↓
useOrderActions
   ↓
Orders API
   ↓
local/cache state update
   ↓
UI refresh
```

---

## 8. Hooks

### `useOrders`

Chịu trách nhiệm:

- tải order theo tab/status;
- nhận danh sách POS cần query;
- quản lý loading/error;
- giữ dữ liệu từng tab;
- bảo vệ UI trước stale/race response;
- hỗ trợ cập nhật hoặc loại bỏ order khỏi state sau action.

Không nên chứa UI notification.

---

### `useOrderActions`

Chịu trách nhiệm cho các mutation nghiệp vụ như:

```text
confirmOrder
finishOrder
cancelOrder
```

Page quyết định cách hiển thị success/error notification.

---

### `useOrderFilters`

Chịu trách nhiệm cho search/filter phía UI.

Hiện tại kitchen filtering không nằm ở hook này.

Khi đổi:

```text
tab
hoặc
kitchen
```

search được reset để query cũ không làm danh sách mới trông như bị mất dữ liệu.

---

## 9. Components

Các component chính:

```text
OrderHeader
OrderStatusTabs
OrderTable
OrderDetail
OrderEditModal
OrderInfo
OrderSummary
OrderStatusBadge
```

### `OrderHeader`

Hiển thị:

```text
Tên trang
Search
Kitchen selector
```

Header sử dụng visual language chung của Web Manager:

- nền trung tính;
- brown/gold brand states;
- không để Ant Design blue state lọt vào UI.

---

### `OrderStatusTabs`

Hiển thị các trạng thái order.

Count chỉ nên hiển thị khi tab đã có dữ liệu:

```text
null → chưa load
0    → đã load và không có order
> 0  → số order hiện có
```

---

### `OrderTable`

Mục tiêu chính là scan dữ liệu nhanh.

Behavior:

- header bảng cố định;
- body table scroll;
- pagination nằm ngoài vùng row scroll;
- sort ngày mặc định theo mới nhất;
- unit filter lấy từ dữ liệu đã load;
- địa chỉ dài dùng ellipsis / tooltip;
- click row hoặc action để mở detail.

Table không nên biến mỗi giá trị thành badge nếu typography/alignment đã đủ diễn đạt.

---

### `OrderDetail`

Chi tiết đơn được tách khỏi table.

Detail chịu trách nhiệm:

- summary;
- request list;
- action phù hợp trạng thái;
- mở modal edit khi được phép.

Edit action chỉ có ở `CHECKING`.

---

## 10. UX rules

Orders được thiết kế như màn vận hành, không phải trang báo cáo.

Ưu tiên:

```text
thông tin quan trọng luôn dễ thấy
→ thao tác nhanh
→ trạng thái rõ
→ tránh scroll toàn page không cần thiết
→ giảm decoration
→ giữ density hợp lý
```

Visual language:

```text
neutral white / cream surfaces
brown / gold brand accent
restrained shadow
clear typography
semantic colors chỉ dùng khi có ý nghĩa nghiệp vụ
```

Không dùng nhiều màu chỉ để tạo cảm giác dashboard.

---

## 11. Error và loading

Nguyên tắc:

- hook trả `loading` / `error`;
- page quyết định notification;
- action button có loading riêng;
- không cho duplicate mutation khi action đang chạy;
- stale response không được overwrite request mới hơn.

---

## 12. Shared rule

Không đưa component/hook vào `shared` chỉ vì nghĩ rằng “sau này có thể dùng”.

Rule:

> Shared is earned.

Chỉ promote lên `shared` khi ít nhất một feature khác thật sự có cùng nhu cầu và abstraction có ý nghĩa.

Ví dụ hiện tại:

```text
useKitchens
```

hợp lý ở shared vì cả Orders và Sales cùng sử dụng.

---

## 13. Không nên làm

Không tạo:

```text
components_new/
orders_v2/
OrdersFinal/
OrdersNew/
```

khi refactor tiếp.

Không:

- duplicate API;
- duplicate status constants;
- fetch cùng dữ liệu ở nhiều layer;
- để page chứa toàn bộ business logic;
- hard-code brand blue của Ant Design;
- sửa architecture và redesign lớn trong cùng một thay đổi không kiểm soát.

---

## 14. Khi thêm tính năng mới

Thứ tự ưu tiên:

```text
1. Xác định business rule
2. Xác định owner của dữ liệu
3. API
4. Hook
5. Component
6. Page orchestration
7. UX states
8. Build / regression test
9. Documentation
```

---

## 15. Checklist trước khi commit

Kiểm tra:

```text
[ ] Đổi tab tải đúng status
[ ] Kitchen selector tải và chọn đúng POS
[ ] Search hoạt động
[ ] Search reset khi đổi tab/kitchen
[ ] Count tab đúng
[ ] Table scroll đúng
[ ] Detail mở/đóng đúng
[ ] CHECKING được edit
[ ] Status khác CHECKING không được edit
[ ] Confirm hoạt động
[ ] Finish hoạt động
[ ] Cancel hoạt động
[ ] Loading chống double click
[ ] Không có AntD blue state ngoài design system
[ ] Responsive không vỡ layout
[ ] Build thành công
```

---

## 16. Kiến trúc tóm tắt

```text
OrdersPage
│
├── shared/useKitchens
│
├── useOrders
│   └── orders api
│
├── useOrderFilters
│
├── useOrderActions
│   └── orders api
│
├── OrderHeader
├── OrderStatusTabs
├── OrderTable
└── OrderDetail
    └── OrderEditModal
```

Feature Orders hiện đã có boundary rõ ràng. Các thay đổi tiếp theo nên ưu tiên sửa đúng layer thay vì mở rộng `OrdersPage` thành một component lớn trở lại.

# Product Management

Feature quản lý sản phẩm của Freshy Web Manager.

Feature này chịu trách nhiệm cho 3 màn hình:

- `/group-menu` — Quản lý thực đơn
- `/item-menu` — Quản lý món ăn
- `/topping-menu` — Quản lý nhóm topping

---

## 1. Cấu trúc

```text
src/features/product-management/
├── api/
│   ├── index.js
│   ├── items.api.js
│   ├── menus.api.js
│   └── toppings.api.js
│
├── components/
│   ├── AssignMenuModal/
│   ├── ItemFormModal/
│   ├── ItemManagementHeader/
│   ├── ItemManagementTable/
│   ├── MenuFormModal/
│   ├── MenuManagementHeader/
│   ├── MenuManagementTable/
│   ├── ToppingEditorModal/
│   ├── ToppingGroupFormModal/
│   ├── ToppingManagementHeader/
│   └── ToppingManagementTable/
│
├── hooks/
│   ├── index.js
│   ├── useItemActions.js
│   ├── useItems.js
│   ├── useMenuActions.js
│   ├── useMenus.js
│   ├── useToppingActions.js
│   └── useToppingGroups.js
│
├── pages/
│   ├── index.js
│   ├── ItemManagementPage/
│   ├── MenuManagementPage/
│   └── ToppingManagementPage/
│
├── styles/
│   └── productManagementControls.scss
│
├── index.js
└── README.md
```

---

## 2. Kiến trúc

Product Management tuân theo cấu trúc:

```text
Page
├── orchestration
├── modal state
├── search / pagination state
├── toast
└── gọi hooks

Hook
├── loading state
├── async action
├── data lifecycle
└── business state

API
└── HTTP/backend contract

Component
└── presentation + interaction UI
```

Không gọi API trực tiếp từ component presentation.

Không sử dụng legacy `src/services/*` cho business của Product Management.

---

## 3. Shared components

Feature sử dụng các shared component chung của hệ thống:

```text
src/shared/components/
├── AppToast/
├── ConfirmModal/
├── ManagementFormModal/
├── ManagementPageHeader/
├── ManagementTable/
└── PrimaryActionButton/
```

### ManagementPageHeader

Dùng cho layout title + description + action area của các màn management.

Business-specific header vẫn có thể wrap component này để cung cấp search/create action.

### ManagementTable

Chịu trách nhiệm cho:

- table surface
- border/radius
- table header
- row density
- hover
- body scroll
- fixed action column
- pagination layout
- scrollbar

SCSS riêng của từng table chỉ xử lý nội dung business-specific trong cell.

### ManagementFormModal

Chịu trách nhiệm cho:

- modal shell
- header
- body scroll
- footer
- cancel button
- primary action
- responsive modal layout

Các form modal chỉ quản lý nội dung nghiệp vụ.

---

## 4. Menu Management

Route:

```text
/group-menu
```

Page:

```text
MenuManagementPage
```

Chức năng:

- hiển thị danh sách thực đơn
- server-side pagination
- tìm kiếm
- tạo thực đơn
- chỉnh sửa thực đơn
- bật/tắt trạng thái
- thêm thực đơn vào POS/trung tâm
- chọn món trong thực đơn
- kéo thả món để thay đổi thứ tự

Thứ tự món được gửi backend bằng:

```js
items: [
  {
    itemId: 1,
    ordinalNumber: 1,
  },
  {
    itemId: 5,
    ordinalNumber: 2,
  },
];
```

Không dùng local table sorter cho danh sách menu server-pagination để tránh tạo cảm giác đang sort toàn bộ dataset.

---

## 5. Item Management

Route:

```text
/item-menu
```

Page:

```text
ItemManagementPage
```

Chức năng:

- hiển thị món ăn
- tìm kiếm
- tạo món
- chỉnh sửa món
- xóa/deactivate món
- upload ảnh
- resize/compress ảnh bằng `pica`
- chọn nhóm topping
- kéo thả nhóm topping để thay đổi thứ tự

Payload thứ tự group:

```js
toppingGroupIds: [
  {
    toppingGroupId: 10,
    ordinalNumber: 1,
  },
  {
    toppingGroupId: 15,
    ordinalNumber: 2,
  },
];
```

Item API sử dụng relative endpoint thông qua:

```text
src/utils/httpRequest
```

Không hard-code:

```text
https://dev.freshy.vn/...
```

`isActive` phải sử dụng nullish fallback:

```js
item.isActive ?? true;
```

không sử dụng:

```js
item.isActive || true;
```

vì cách đó làm mất giá trị `false`.

---

## 6. Topping Management

Route:

```text
/topping-menu
```

Page:

```text
ToppingManagementPage
```

Chức năng:

- hiển thị nhóm topping
- tìm kiếm
- tạo nhóm topping
- chỉnh sửa nhóm topping
- cấu hình min/max
- single / multiple selection
- thêm topping
- bật/tắt topping trong group
- sửa topping
- xóa topping
- kéo thả topping để thay đổi thứ tự

Thứ tự topping sử dụng:

```js
ordinalNumber;
```

API update topping giữ nguyên HTTP response nếu consumer cần kiểm tra:

```js
response.status;
```

---

## 7. Drag & Drop

Product Management hiện có 3 loại reorder:

```text
Menu
└── Item

Item
└── Topping Group

Topping Group
└── Topping
```

Nguyên tắc:

```text
UI order
    ↓
normalize
    ↓
ordinalNumber = index + 1
    ↓
payload
    ↓
backend
```

Không chỉ reorder trên giao diện.

---

## 8. Business text validation

Các field tên của Product Management dùng utility chung:

```text
src/shared/utils/businessTextValidation.js
```

Các field áp dụng gồm:

- tên món ăn;
- tên thực đơn;
- tên nhóm topping;
- tên topping.

### Rule IME-safe

Không sanitize, trim hoặc normalize giá trị của controlled input trong `onChange`.

Lý do: UniKey và các IME khác sử dụng composition để tạo ký tự tiếng Việt. Nếu React rewrite `value` trong lúc composition đang diễn ra, một số browser / máy có thể làm mất ký tự.

Luồng chuẩn:

```text
user typing
    ↓
raw controlled value
    ↓
Add / Save
    ↓
normalizeBusinessText()
    ↓
getBusinessTextValidationError()
    ↓
API payload
```

`normalizeBusinessText()` chịu trách nhiệm:

- normalize Unicode về NFC;
- gộp whitespace liên tiếp;
- trim khoảng trắng đầu / cuối.

`getBusinessTextValidationError()` chịu trách nhiệm:

- required validation;
- giới hạn độ dài;
- kiểm tra tập ký tự business name được hỗ trợ.

Validation không âm thầm xóa ký tự user đã nhập. Nếu value không hợp lệ, form hiển thị lỗi tại business boundary (`Add` / `Save`).

Search input không áp dụng business-name validation vì search cần giữ nguyên query của user.

## 9. Feedback

Không gọi trực tiếp:

```js
notification.success(...)
notification.error(...)
message.success(...)
message.error(...)
```

Product Management sử dụng:

```js
import toast from "../../../../shared/components/AppToast";
```

Ví dụ:

```js
toast.success({
  message: "Cập nhật thành công",
});
```

Error description dùng shared utility:

```text
src/shared/utils/getErrorDescription.js
```

---

## 10. UI conventions

Product Management sử dụng Freshy design language:

```text
Primary color:
#7b4b08

App background:
#f6f3ef

Surface:
#ffffff

Soft surface:
#faf7f3
```

Không sử dụng Ant Design blue làm màu interaction chính.

Table:

```text
Header         48px
Row            ~60px
Pagination     ~52px
Radius         14px
```

Modal:

```text
Input          42px
Search         36px
Primary button 44px
Modal radius   16px
Panel radius   11px
```

---

## 11. Pagination

Menu Management sử dụng server pagination.

Item/Topping hiện sử dụng client-side dataset.

Dropdown thay đổi:

```text
10 / page
```

đã được ẩn khỏi UI.

Page size hiện được điều khiển bởi state/API của từng màn.

---

## 12. Legacy cleanup

Các implementation legacy sau đã được thay thế bởi Product Management:

```text
src/pages/GroupMenu
src/pages/ManageItems
src/pages/GroupTopping

src/components/ItemList
src/components/ToppingMenu

src/components_new/edit_menu
src/components_new/edit_item
src/components_new/edit_group_topping
src/components_new/edit_topping
src/components_new/add_topping
```

Không tạo lại business logic trong các folder legacy.

---

## 13. Routes

Router phải trỏ tới feature mới:

```js
import {
  ItemManagementPage,
  MenuManagementPage,
  ToppingManagementPage,
} from "../features/product-management";
```

Mapping:

```text
/group-menu   → MenuManagementPage
/item-menu    → ItemManagementPage
/topping-menu → ToppingManagementPage
```

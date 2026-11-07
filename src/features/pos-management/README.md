# POS Management

Feature quản lý trung tâm / bếp của manager.

Route:

```text
/manage-pos
```

## Responsibilities

Feature này chịu trách nhiệm cho:

- lấy danh sách trung tâm thuộc manager;
- tạo trung tâm;
- cập nhật thông tin trung tâm;
- deactivate trung tâm;
- hiển thị bảng quản lý trung tâm;
- modal tạo / chỉnh sửa trung tâm.

Feature không chịu trách nhiệm cho:

- thực đơn của bếp;
- địa chỉ chi tiết của bếp;
- quản lý đại lý;
- quản lý giao hàng;
- authentication UI;
- modal gán POS cho Agency/Shipper.

Các phần đó thuộc feature hoặc flow riêng.

---

## Structure

```text
src/features/pos-management/
├── api/
│   ├── index.js
│   └── posManagement.api.js
├── components/
│   ├── index.js
│   ├── PosFormModal/
│   │   ├── index.js
│   │   └── PosFormModal.scss
│   ├── PosHeader/
│   │   ├── index.js
│   │   └── PosHeader.scss
│   └── PosTable/
│       ├── index.js
│       └── PosTable.scss
├── hooks/
│   ├── index.js
│   ├── usePosActions.js
│   └── usePosList.js
├── pages/
│   ├── index.js
│   └── PosManagementPage/
│       ├── index.js
│       └── PosManagementPage.scss
├── index.js
└── README.md
```

---

## Architecture

### Page

`PosManagementPage` là orchestration layer.

Page chịu trách nhiệm:

- kết nối hooks;
- điều khiển modal state;
- điều phối create / update / deactivate;
- hiển thị notification;
- kết nối các presentation components.

Page không trực tiếp gọi HTTP request.

---

### API

`api/posManagement.api.js` sở hữu backend contracts của feature.

Các API hiện tại:

```text
GET  manager/pos-info
POST pos/create
PUT  pos/update-pos/:posId
PUT  pos/:posName/deactivate
```

UI sử dụng tên `deactivatePos` thay vì `removePos` để phản ánh đúng behavior của backend.

---

## Hooks

### `usePosList`

Chịu trách nhiệm:

- fetch danh sách POS;
- loading state;
- error state;
- refresh;
- tránh stale request cập nhật state.

### `usePosActions`

Chịu trách nhiệm:

- create;
- update;
- deactivate;
- action loading state;
- chống duplicate action;
- gọi callback sau mutation thành công.

---

## Components

### `PosHeader`

Presentation component cho page heading và primary action.

Primary action dùng shared component:

```text
src/shared/components/PrimaryActionButton
```

Không tự định nghĩa lại style primary button trong feature.

### `PosTable`

Presentation component cho danh sách POS.

Behavior:

- chỉ hiển thị POS có `isActive !== false`;
- edit là action trực tiếp;
- destructive action nằm trong overflow menu;
- pagination chỉ xuất hiện khi số record lớn hơn page size;
- có loading / error / empty state;
- typography và spacing đồng bộ với Orders / Order Summary.

### `PosFormModal`

Một modal dùng chung cho cả:

```text
create
edit
```

Không duy trì hai form riêng biệt.

---

## Shared components

Feature sử dụng:

```text
src/shared/components/PrimaryActionButton
src/shared/components/ConfirmModal
```

`PrimaryActionButton` được dùng cho các primary action có cùng visual language như:

```text
Thêm trung tâm
Xuất Excel
Chỉnh sửa định lượng
```

`ConfirmModal` được dùng cho destructive confirmation thay vì mỗi feature tự tạo một `Modal.confirm`.

Rule:

> shared is earned.

Không đưa component vào `shared` chỉ vì dự đoán có thể dùng lại trong tương lai.

---

## Delete behavior

UI gọi thao tác:

```text
Xóa trung tâm
```

Nhưng backend hiện tại thực hiện:

```text
deactivate
```

Endpoint:

```text
PUT pos/:posName/deactivate
```

Do đó đây không phải hard delete.

---

## Route

Public feature export:

```js
export { PosManagementPage } from "./pages";
```

Router sử dụng:

```js
import { PosManagementPage } from "../features/pos-management";
```

Route:

```text
/manage-pos
```

không phụ thuộc page/component POS legacy.

---

## UI conventions

POS Management tuân theo UI conventions chung của Web Manager:

- page spacing thống nhất với Orders / Order Summary;
- typography thống nhất;
- brand brown / cream;
- destructive action không dùng màu brand;
- primary page actions dùng `PrimaryActionButton`;
- confirmation dùng `ConfirmModal`;
- tránh Ant Design default blue;
- pagination không hiển thị khi không cần thiết;
- action column ưu tiên edit trực tiếp và đưa destructive action vào overflow menu.

---

## Legacy cleanup

Các implementation cũ của `/manage-pos` được thay thế:

```text
src/pages/ManagePos
src/components/PosList
src/components/Auth/PosForm
```

POS create modal không còn được quản lý bởi global Auth context.

`src/components/ManagePosModal` không thuộc page legacy `/manage-pos`.

Component này vẫn đang được Agency/Shipper sử dụng để quản lý POS được gán cho user, vì vậy không xóa trong migration này.

---

## Final QA

Các kiểm tra nên thực hiện trước khi đóng feature:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'components/Auth/PosForm|components/PosList|EditPosModal|openFormPos|setOpenFormPos|pages/ManagePos' \
  src
```

Kỳ vọng: không có output.

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'config\.(createPos|updatePos|removePos)' \
  src
```

Kỳ vọng: không có output.

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  'Modal\.confirm' \
  src/features/pos-management
```

Kỳ vọng: không có output.

Cuối cùng:

```bash
npm run build
```

---

## Definition of Done

Feature được coi là hoàn thành khi:

- `/manage-pos` sử dụng feature architecture;
- POS CRUD không nằm trong generic service;
- create / edit dùng cùng `PosFormModal`;
- delete confirmation dùng shared `ConfirmModal`;
- primary action dùng shared `PrimaryActionButton`;
- legacy POS components không còn consumer;
- create / edit / deactivate đều refresh danh sách;
- loading / error / empty states hoạt động;
- responsive layout hoạt động;
- production build thành công.

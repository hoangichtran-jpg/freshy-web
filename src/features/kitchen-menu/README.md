# Kitchen Menu

Feature quản lý **Thực đơn bếp** cho Web Manager.

Route hiện tại:

```text
/manage-menu
```

Feature này thay thế implementation legacy của `MenuManager` và gom toàn bộ logic quản lý thực đơn theo bếp, trạng thái menu và vận hành ca vào một boundary riêng.

## Phạm vi trách nhiệm

`kitchen-menu` chịu trách nhiệm cho:

- chọn trung tâm / bếp đang quản lý;
- tải danh sách thực đơn của bếp;
- bật / tắt trạng thái thực đơn;
- xóa thực đơn khỏi bếp;
- xem nhanh các món thuộc từng thực đơn;
- mở flow quản lý ca;
- chọn thực đơn cho ca;
- chọn menu ẩn / đặc biệt khi mở ca;
- thiết lập tồn kho đầu ca;
- mở ca thường / ca đặc biệt;
- đóng ca thường / ca đặc biệt.

Feature **không** chịu trách nhiệm cho CRUD danh mục thực đơn toàn hệ thống, CRUD món ăn, CRUD topping, quản lý POS / trung tâm hay quản lý đơn hàng.

## Cấu trúc

```text
src/features/kitchen-menu/
├── index.js
├── api/
│   ├── index.js
│   └── kitchenMenu.api.js
├── components/
│   ├── index.js
│   ├── KitchenMenuHeader/
│   ├── KitchenMenuTable/
│   ├── ShiftActionModal/
│   ├── ShiftMenuModal/
│   └── ShiftInventoryModal/
├── hooks/
│   ├── index.js
│   ├── useKitchenMenus.js
│   ├── useKitchenMenuActions.js
│   └── useShiftActions.js
├── pages/
│   ├── index.js
│   └── KitchenMenuPage/
│       ├── index.js
│       └── KitchenMenuPage.scss
└── README.md
```

Shared dependencies đang dùng:

```text
src/shared/hooks/useKitchens
src/shared/components/PrimaryActionButton
src/shared/components/ConfirmModal
src/shared/components/AppToast
```

## Kiến trúc

Boundary chính:

```text
KitchenMenuPage
    ↓
hooks
    ↓
api
```

UI tree:

```text
KitchenMenuPage
├── KitchenMenuHeader
├── KitchenMenuTable
├── ShiftActionModal
├── ShiftMenuModal
├── ShiftInventoryModal
└── ConfirmModal (shared)
```

Nguyên tắc:

- **Page** làm orchestration và nối flow.
- **Hooks** giữ state, async state và business actions.
- **API** sở hữu endpoint / HTTP contract.
- **Components** tập trung render UI và phát event qua props.
- Không gọi generic `config.*` hoặc service legacy từ component mới.
- Không đưa code vào `shared` chỉ vì “có thể dùng sau”.

## API ownership

API của feature nằm tại:

```text
src/features/kitchen-menu/api/kitchenMenu.api.js
```

Các nhóm endpoint đã migrate về feature gồm:

```text
menu-pos/api/pos-menu
menu-pos/{id}/change-status
menu-pos-days/{id}
/shifts/{posId}/open
/shifts/{posId}/close
```

Component và page không gọi trực tiếp các endpoint trên.

## Hooks

### `useKitchenMenus`

Sở hữu dữ liệu danh sách thực đơn của bếp:

- fetch menu theo `posId`;
- loading / error;
- refresh khi cần;
- cập nhật status local;
- remove menu local sau mutation thành công.

Toggle status dùng optimistic UI:

```text
user toggle
→ update local state ngay
→ gọi API
→ success: giữ nguyên
→ error: rollback + toast lỗi
```

Không refetch toàn bộ table sau mỗi lần bật / tắt.

### `useKitchenMenuActions`

Sở hữu mutation của thực đơn:

- đổi trạng thái;
- xóa menu;
- mutation loading state theo row.

### `useShiftActions`

Sở hữu các action vận hành ca:

- mở ca;
- đóng ca;
- `openingShift`;
- `closingShift`.

## Flow quản lý ca

```text
Quản lý ca
    ↓
Chọn ca thường / ca đặc biệt
    ↓
Mở ca
    ↓
Bước 1/2 — Chọn thực đơn
    ↓
Bước 2/2 — Thiết lập tồn kho đầu ca
    ↓
Mở ca
```

Navigation:

```text
ShiftActionModal
      ↓
ShiftMenuModal
      ↓
ShiftInventoryModal
```

Quy tắc:

- `X` hủy toàn bộ flow;
- `Quay lại` tại bước chọn menu quay lại modal Quản lý ca;
- `Quay lại` tại bước tồn kho quay lại bước chọn menu;
- state selection được giữ khi quay lại giữa các bước phù hợp.

## Chọn thực đơn cho ca

`ShiftMenuModal` hỗ trợ:

- tìm kiếm menu;
- chọn từng menu;
- chọn tất cả trong tập đang filter;
- bỏ chọn;
- đánh dấu `Ẩn menu`;
- hiển thị số món;
- preview tên món;
- footer cố định;
- list scroll riêng.

Menu bị bỏ chọn phải đồng thời được xóa khỏi state `hiddenMenus`.

## Thiết lập tồn kho đầu ca

`ShiftInventoryModal` hiển thị theo món.

Mỗi món có:

```text
Tên món
Số suất
Định lượng
Topping & nguyên liệu
```

Topping sử dụng segmented control:

```text
0 | 0.5 | 1
```

Option đang chọn dùng brand state rõ ràng. Khi quantitative của topping bằng `0`, field chọn món để trừ tồn bị disable.

### Validation hiện tại

Trước khi mở ca:

- `Số suất >= 1`;
- `Định lượng >= 0`;
- topping có quantitative `> 0` phải có món đích để trừ tồn;
- phải có POS được chọn;
- phải chọn ít nhất một menu;
- menu được chọn phải tạo ra ít nhất một món active.

Không tự ép input đã bị clear về `1`. Validation phải báo lỗi rõ ràng cho user.

### Lưu ý nghiệp vụ

Hiện items được merge theo `itemId` khi cùng một món xuất hiện trong nhiều menu. Điều này giả định inventory được quản lý theo **món duy nhất**, không phải theo từng `menuItemId`.

Nếu backend sau này xác nhận inventory phải tách theo từng menu-item, phần merge này cần được xem lại trước khi thay payload.

## Kitchen Menu Table

Table hiển thị:

```text
STT
Tên thực đơn
Món ăn
Trạng thái
Action
```

UI conventions:

- typography đồng bộ POS / Orders / Order Summary;
- action column cố định bên phải;
- destructive action nằm trong menu `...`;
- status sử dụng Switch;
- preview một số món ngay trên row;
- `+N món` mở popover để xem toàn bộ món;
- table body có scroll riêng khi cần;
- pagination chỉ hiện khi vượt page size;
- empty / loading / error state không dùng AntD blue mặc định.

## Header

`KitchenMenuHeader` gồm:

```text
Thực đơn bếp
Mô tả

[ Chọn trung tâm ] [ Quản lý ca ]
```

Primary CTA dùng:

```text
src/shared/components/PrimaryActionButton
```

Không copy lại CSS primary button trong feature. Page chịu trách nhiệm spacing ngoài.

## Feedback UI

Feature dùng shared feedback:

```text
PrimaryActionButton
ConfirmModal
AppToast
```

Không dùng trực tiếp `notification.success(...)` / `notification.error(...)` trong feature mới.

Ví dụ:

```js
toast.success({
  message: "Mở ca thành công",
});

toast.error({
  message: "Không thể mở ca",
  description: "Chi tiết lỗi...",
});
```

Toggle switch thành công không cần success toast vì switch đã là feedback trực tiếp. Toggle thất bại thì rollback state + error toast.

## Legacy cleanup

Sau migration, các implementation legacy liên quan màn `/manage-menu` không còn được route sử dụng.

Các nhóm legacy đã được loại bỏ / tách khỏi runtime của feature gồm:

```text
src/pages/MenuManager
src/components/MenuManagerItem
src/components_new/body_header/pos
src/services/menuPosDay.js
```

Các bridge/service cũ chỉ được xóa khi không còn consumer khác.

## Route

Route public của feature:

```text
/manage-menu
```

Route phải render page từ feature root thay vì import page legacy trực tiếp.

Ví dụ:

```js
import {
  KitchenMenuPage,
} from "../features/kitchen-menu";
```

## Quy tắc phát triển tiếp

Nên:

- đặt API mới trong `api/`;
- đặt business async state trong hook;
- giữ page làm orchestration;
- reuse shared component đã được chứng minh;
- xử lý optimistic UI cho mutation nhỏ nếu rollback an toàn;
- giữ UX đồng bộ với các màn manager khác.

Không nên:

- gọi endpoint trực tiếp từ component;
- thêm logic mới vào `services/index.js`;
- tạo `components_new`;
- tạo `v2`, `final`, `new-new`;
- copy style của `PrimaryActionButton`;
- gọi `notification.*` trực tiếp;
- refetch cả page cho một mutation nhỏ nếu local update đủ an toàn.

## Final QA

Trước khi commit:

```bash
npm run build
```

Kiểm tra legacy reference:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'PosMenuHeader|pages/MenuManager|MenuManager' \
  src
```

Kiểm tra feature không quay lại generic config/service:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'config\.|components_new|pages/MenuManager' \
  src/features/kitchen-menu
```

Kiểm tra endpoint ownership:

```bash
grep -RIn \
  --include='*.js' \
  --include='*.jsx' \
  -E 'menu-pos/api/pos-menu|menu-pos/.*/change-status|menu-pos-days/|/shifts/.*/open|/shifts/.*/close' \
  src
```

Các endpoint trên nên nằm ở feature API thay vì bị duplicate trong page/component.

## Definition of Done

Kitchen Menu được coi là migrate xong khi:

- `/manage-menu` dùng feature page mới;
- API thuộc feature;
- list state và mutation state nằm trong hooks;
- page không gọi `config.*`;
- legacy page/component không còn runtime consumer;
- toggle status không reload toàn bộ table;
- delete dùng shared confirm;
- CTA dùng shared primary button;
- feedback dùng shared toast;
- flow mở ca có navigation đúng giữa các bước;
- inventory được validate trước khi gửi;
- UI responsive;
- build pass;
- grep legacy sạch;
- README phản ánh đúng implementation thực tế.

## Commit gợi ý

```bash
git add -A
git commit -m "refactor: migrate kitchen menu feature"
```

Sau khi feature này được commit sạch, có thể tiếp tục sang:

```text
Quản lý sản phẩm
├── Danh sách thực đơn
├── Danh sách món ăn
└── Danh sách topping
```


## Safe shift management (UI phase 1)

`ShiftActionModal` is the single entry point for both shift operations and
request acceptance. It now reads the actual backend state instead of guessing
from local UI state:

- `GET /shifts/{posId}/ordering` (ADMIN/SUPER_ADMIN): current shift and admission state.
- `PUT /shifts/{posId}/ordering` with `{shiftId,status}`: PAUSED / ACCEPTING.
- `GET /shifts/{posId}/close-preflight?special=false`: read-only blockers and readiness.
- `POST /shifts/{posId}/close?special=false`: still authoritative; UI performs a preview first,
  but backend always revalidates before committing.

State/data flow: `KitchenMenuPage` → `useShiftOperatingControls` → `kitchenMenu.api`.
Presentation: `ShiftActionModal`. This does **not** auto-cancel requests or mutate
Redis directly. Reopening acceptance requires a still-open shift and admin role.

UI disables Close until a ready preflight for the same shift and shift type,
requires a second confirmation, and refreshes preflight on a 409 response. If
backend is unavailable, the modal fails closed (buttons disabled) rather than
pretending the restaurant can accept orders.

Verify with:

```bash
CI=true npm test -- --watch=false --runInBand src/features/kitchen-menu/utils/shiftClose.test.js src/features/kitchen-menu/api/kitchenMenu.api.test.js
npm run build
```

End-to-end checklist: `docs/ui-ux/shift-management-operations.md`.

## UX kiểm tra đóng ca theo 3 cấp

1. Mở modal: chỉ lấy trạng thái ca + `close-preflight`; cảnh báo `blockerCount`, không hiển thị đơn vị/địa chỉ.
2. Quản lý chọn **Xem danh sách đơn**: gọi `close-blockers`, nhóm theo `(unit, address)`, hiển thị request cho từng nhóm.
3. Chọn một request: gọi `close-blockers/{requestId}` có `shiftId` hiện tại; chỉ đọc chi tiết món, topping, thanh toán. Không hủy đơn ngay trong modal.

Nút tạm ngừng/mở lại đã chuyển sang `src/features/sales`, chỉ dành cho ADMIN/SUPER_ADMIN. Nếu backend trả 409 hoặc đổi ca phải tải lại preflight. Danh sách >40 có cảnh báo bị rút gọn.

## Current shift close UX — updated 2026-10-25

**Supersedes the earlier "Safe shift management (UI phase 1)" and "UX kiểm tra
đóng ca theo 3 cấp" instructions above.** `ShiftActionModal` now has NO
manual preflight button, NO special-shift selector, and shows only Open or Close
based on shift snapshot. POST `/close?special=false` is the decisive check.
Only confirmed current-shift PENDING 409 opens standalone
`ShiftCloseBlockersModal` with lazy grouped list + lazy request detail.
Other failures use the shared `AppModal` notice. Read-only `close-preflight`
is requested after the PENDING 409 and on "Kiểm tra lại", not before the
initial Close click. Details and tests: `docs/ui-ux/shift-close-click-to-check.md`.


## UI V3 — Blocker modal tinh gọn

Cảnh báo đóng ca bị chặn hiển thị **Chưa thể đóng ca** / **Còn N đơn chưa hoàn tất**,
không còn khối thông báo xanh riêng. Mã đơn duy nhất được lấy trực tiếp từ
preflight đã có, không eager-fetch dữ liệu chi tiết. Chỉ bấm **Xem đơn cần xử lý**
hoặc **Xem danh sách đơn** mới gọi API nhóm. Nút **Kiểm tra lại** vẫn chỉ GET
preflight, không tự POST đóng ca; xem `docs/ui-ux/shift-close-click-to-check.md`.

#### Close V4 / request cancellation safety

The `ShiftCloseBlockersModal` reveals optional per-request `Hủy đơn đang chờ` only when `/close-blockers` returns `pendingCancellationEnabled:true`, detail is `PENDING` and `NOT_PAID`, and the manager confirms separately. The backend must recheck status, current shift ledger, order admission and payment; no FE-only bypass. Cancel then re-check; closing is a separate explicit confirmation. Feature off by default pending BE concurrency and recovery hardening.

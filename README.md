# F&B Web Manager

Frontend quản lý F&B đang được refactor dần từ cấu trúc legacy theo loại file:

```text
pages/
components/
services/
```

sang kiến trúc theo business feature:

```text
app/
features/
shared/
```

Refactor được thực hiện incremental để giữ ứng dụng hoạt động sau từng bước.

---

# Architecture

```text
src/
├── app/                    # App-level composition
│
├── features/               # Business features
│   ├── orders/
│   └── sales/
│
├── shared/                 # Proven reusable code
│
├── pages/                  # Legacy - migrate dần
├── components/             # Legacy - migrate dần
├── components_new/         # Legacy/transitional - không tạo mới
├── services/               # Legacy API layer - migrate dần theo feature
├── layouts/                # Legacy
├── routes/                 # Legacy route config
└── ...
```

Chi tiết:

```text
docs/architecture/frontend-architecture.md
```

---

# Refactor principles

## 1. Incremental migration

Không rewrite toàn bộ ứng dụng.

Mỗi lần chỉ chuyển một responsibility rõ ràng.

---

## 2. One risk per step

Không trộn trong cùng một step:

```text
architecture refactor
+
business behavior change
+
UI redesign
```

---

## 3. App must keep running

Ứng dụng phải tiếp tục chạy sau mỗi refactor step.

---

## 4. Feature-first

Code đặc thù business thuộc feature tương ứng.

Ví dụ:

```text
Order lifecycle
→ features/orders

Sales / shift summary
→ features/sales
```

---

## 5. Shared is earned

Chỉ đưa code vào:

```text
src/shared/
```

khi có nhiều feature thực sự sử dụng cùng một abstraction generic.

Không tạo shared component chỉ vì nghĩ rằng có thể reuse trong tương lai.

---

## 6. No new transitional folders

Không tạo thêm:

```text
components_new
v2
final
new_new
```

Code mới phải đi thẳng vào kiến trúc đích.

---

## 7. Page orchestrates

Page chịu trách nhiệm composition.

Business data lifecycle thuộc hooks.

HTTP transport thuộc feature API.

Presentation thuộc components.

---

## 8. Code and docs change together

Mỗi refactor step phải cập nhật documentation liên quan.

---

# Feature status

## Orders

Location:

```text
src/features/orders/
```

Status:

```text
MIGRATION COMPLETE
```

Orders currently owns:

- Order status configuration;
- Order data fetching;
- Order actions;
- Order filtering;
- Order table;
- Order detail;
- Order editing;
- Order page orchestration.

The legacy Orders implementation has already been migrated to the feature architecture.

See:

```text
src/features/orders/README.md
```

---

## Sales

Target:

```text
src/features/sales/
```

Legacy runtime source:

```text
src/pages/OrderSummary/
```

Business meaning:

```text
Doanh số bán hàng
```

Status:

```text
Step 1 — Feature boundary + documentation
```

Current Step 1 does not modify runtime behavior.

Migration roadmap:

```text
Step 1   Feature boundary + documentation
Step 2   Sales API layer
Step 3   POS / kitchen selection lifecycle
Step 4   useShiftSummary
Step 5   Edit initial quantity action
Step 6   Presentation components
Step 7   SalesSummaryPage
Step 8   Route switch
Step 9   Legacy cleanup
Step 10  UI/UX redesign
```

See:

```text
src/features/sales/README.md
docs/refactor/sales-migration-plan.md
```

---

# Important naming note

There are currently two different legacy concepts with similar names.

```text
src/pages/OrderSummary/
```

is:

```text
Doanh số bán hàng
```

and is being migrated to:

```text
features/sales
```

Meanwhile:

```text
src/pages/OrderSummaryManage/
```

is a different Order summary/report screen.

These two domains must not be merged simply because their legacy filenames are similar.

---

# Definition of Done for a refactor step

A step is complete only when:

- code changes stay within the intended scope;
- unrelated behavior remains unchanged;
- application imports/build remain valid;
- README/docs are updated;
- migration status is documented;
- the step can be reverted independently if necessary.

---

# UI Foundation progress

Current shared UI foundation status:

```text
5A Typography foundation          ✅
5A.2 Orders typography            ✅
5A.3 Global typography sweep      ✅
5B Shared component consolidation ✅
5C AppToast                       ✅
5D Form/control consistency       ✅
5E Visual regression              ✅
5F Shared UI primitives           🔄
5F.1 AppButton                    ✅
5F.2 AppInput / TextArea          ✅
5F.3 AppInputNumber               ✅
5F.4 AppSelect                    ✅
5F.5 SearchInput                  ✅
5F.6 AppModal / modal shell       ✅
5F.7 EmptyState                    ✅
5F.8 Shared primitive audit        ✅
5F.9 Final regression              ← next
```

Global text typography now uses the shared semantic token scale. Numeric `font-size` values that remain in SCSS are reserved for icon/glyph sizing rather than text.

See:

```text
docs/refactor/step-05a3-global-typography-sweep.md
docs/refactor/step-05f7-empty-state.md
docs/refactor/step-05f8-shared-ui-audit.md
```

---

# Current work

Current active work:

```text
UI Foundation
→ Step 5F.8 complete
→ AppButton, AppInput, AppInputNumber, AppSelect, SearchInput, AppModal and EmptyState established
→ remaining raw Ant Design controls are specialized/feature-owned
```

Next:

```text
Step 5F.9
→ run production build
→ smoke-test shared controls at desktop/tablet/mobile widths
→ close UI Foundation before Web Order UX redesign
```

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

- Shift Inventory UX: loại bỏ ô định lượng topping trùng lặp; xem tài liệu Sales editor.

- Inventory editor: sửa tương thích ESLint cho crypto.randomUUID().

- Shift Inventory UI bước 4: Chỉnh tồn dùng nguyên bố cục Mở ca; xem docs/refactor/sales/step-shift-inventory-editor.md.

- Inventory Editor: hiển thị Còn lại dạng read-only bên cạnh Định lượng, dùng chung layout Mở ca.

## Shift History — STT và ngày giờ

Bảng lịch sử ca bỏ tên ca, thêm STT và chuẩn hóa ngày giờ. Xem `docs/refactor/sales/step-shift-history-table.md`.

- Shift History: chuyển timestamp UTC sang giờ Việt Nam (Asia/Ho_Chi_Minh). Xem docs/refactor/sales/step-shift-history-table.md.

## Shift history detail redesign

Danh sách món chỉ còn Tên món / Ban đầu / Đã bán / Doanh thu.
Lịch sử chỉnh sửa được thiết kế lại, dùng nhãn tiếng Việt.
Doanh thu từng món đang chờ backend cung cấp.

Xem docs/refactor/sales/step-shift-history-detail-ui.md.


## Shared header alignment

Chuẩn hóa căn chỉnh POS Select và các nút hành động
trong ManagementPageHeader.

Xem `docs/refactor/ui/shared-header-alignment.md`.

## Order report detail on demand

Click đơn để GET chi tiết mới từ PostgreSQL. Xem docs/refactor/order-summary/detail-on-demand.md.

## Order detail visual redesign

Tối ưu giao diện Chi tiết đơn hàng, giữ nguyên API và loading/retry. Xem docs/refactor/order-summary/detail-modal-ui.md.

## Chỉnh tồn ca: chỉ được chọn món cùng menu (frontend patch)

Đã loại bỏ việc gọi phân trang menu khi mở modal chỉnh tồn. Các món được phép trừ tồn chỉ lấy từ ca hiện tại và phải có ít nhất một `menuId` chung với món nguồn. Một món thuộc nhiều menu sẽ mang `menuIds` trong `menuSnapshot` khi mở ca.

**Cần cập nhật backend trước khi deploy:** lưu `menuIds` từ snapshot và trả về trong từng `items[]` của `GET /shifts/{shiftId}/inventory/edit`; validate menu membership trong PUT chỉnh tồn. Ca cũ thiếu dữ liệu không được tự động mở khóa chọn món; chỉ được chỉnh số suất / định lượng.

Chi tiết và checklist: `docs/refactor/sales/step-inventory-menu-membership.md`.


### Shift management UI (Kitchen Menu + Sales)

Trạng thái ACCEPTING/PAUSED và Pause/Resume đặt tại **Doanh số bán hàng**;
modal `/manage-menu` chỉ kiểm tra điều kiện đóng ca, hiển thị số lượng blocker,
và tải thông tin theo yêu cầu của quản lý. Chi tiết: `docs/ui-ux/shift-close-progressive-disclosure.md`.

### UI ngừng nhận đơn và đóng ca (on demand)

- Tạm ngừng / mở nhận đơn ở **Doanh số bán hàng → Ca hiện tại** (chỉ ADMIN/SUPER_ADMIN; ảnh hưởng mọi luồng request mới của POS).
- **Quản lý ca** chỉ kiểm tra đóng ca và hiện số lượng cần xử lý. Bấm **Xem danh sách** mới tải đơn vị/địa chỉ; chọn request mới tải món/topping/thanh toán.
- Cần backend có `GET /shifts/{posId}/close-blockers` và `/close-blockers/{requestId}`. Nếu chưa deploy backend tương ứng, danh sách sẽ báo lỗi; không tự suy diễn từ preflight.
- Không tự đổi trạng thái request hoặc xóa ledger. `POST /close` vẫn tái kiểm tra an toàn.
- Unit/API/UI: `CI=true npm test -- --watch=false --runInBand src/features/kitchen-menu/utils/closeBlockers.test.js src/features/kitchen-menu/api/kitchenMenu.api.test.js`; sau đó `npm run build`.

### Quản lý ca: bấm đóng ca để tự kiểm tra (UI review 25/10/2026)

**Bản thiết kế hiện hành (thay thế mô tả kiểm tra thủ công ở phía trên):**
ẩn Ca đặc biệt; bỏ `Kiểm tra đóng ca`; khi bấm `Đóng ca` gọi POST backend ngay.
409 xác nhận blocker `PENDING` đúng ca → modal đơn tồn riêng, tra theo
đơn vị/địa chỉ và xem từng request theo nhu cầu; lỗi khác → modal thông báo
của web (`AppModal`). Không có auto-cancel và không tự resume nhận đơn.
Chi tiết luồng, code, test và QA: `docs/ui-ux/shift-close-click-to-check.md`.


### UI đóng ca V3 — modal cảnh báo tinh gọn (25/10/2026)

`ShiftCloseBlockersModal` chỉ nhấn một vấn đề (`Chưa thể đóng ca` + số đơn),
điều hướng qua dòng **Xem đơn cần xử lý / Xem danh sách đơn**; ghi chú `PAUSED`
chỉ là một dòng thông tin phụ (nếu trạng thái thực tế xác nhận). `Để sau` và
`Kiểm tra lại` giữ luồng cũ, không tự đóng ca. Phạm vi này **chỉ sửa frontend**.
Spec, accessibility và QA: `docs/ui-ux/shift-close-click-to-check.md`.

### UI/UX V4 — Doanh số & đóng ca (2026-10-25)

- `Doanh số bán hàng` uses a compact operational status bar, an icon-only refresh control and a centered `AppModal` confirmation for Pause/Resume. The duplicate `Xem lịch sử ca` shortcut was removed (the existing tab remains).
- `Đóng ca` keeps the V3 progressive-disclosure modal. On a verified `PENDING` blocker, managers can inspect groups → request details, and when the BE explicitly advertises `pendingCancellationEnabled` they see a guarded `Hủy đơn đang chờ` action with inline confirmation.
- A successful cancellation never silently closes the shift: it refreshes preflight and asks the manager to explicitly close again. MAKING/CHECKING/payment mismatch is never eligible.
- BE `freshy.shift.close.pending-cancel-enabled` remains `false` unless staging audit is complete. See `docs/ui-ux/sales-admission-and-close-v4.md` and the BE shift close safety document.

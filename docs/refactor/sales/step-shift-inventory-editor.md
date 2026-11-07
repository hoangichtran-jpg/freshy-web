# Shift Inventory Editor — Frontend Migration

## Bước 1 — API layer

- GET /shifts/current?posId=... để lấy shiftId.
- GET /shifts/{shiftId}/inventory/edit để lấy dữ liệu ca đang mở.
- PUT /shifts/{shiftId}/inventory để cập nhật bằng Operation Journal.
- Header bắt buộc: Idempotency-Key.
- Ngừng sử dụng PUT /shifts/{posId}/items/initial (HTTP 410).

## Tiếp theo

- Xây data adapter với expectedInitialQuantity,
  expectedQuantitative và expectedTargetItemId.
- Kết nối hook mutation với idempotency.
- Refactor EditInitialQuantityModal.
- Test UI và responsive trước khi deploy.

## Bước 2 — Hook và modal journal-based

- GET /shifts/current xác định shiftId OPENED.
- Modal gồm tab Món và Topping.
- PUT chỉ gửi trường thay đổi cùng expected*, reason.
- Giữ Idempotency-Key khi timeout hoặc HTTP 5xx.
- HTTP 409 yêu cầu tải lại dữ liệu ca.
- Nút chỉnh tồn chỉ hiện cho ADMIN/SUPER_ADMIN.
- Chưa deploy; phải build và kiểm thử UI trước.

## Bước 3 — UI chung cho mở ca và chỉnh tồn kho

- `src/features/shift-inventory/components/InventoryItemCards/` là component trình bày chung.
- Mở ca giữ nguyên form, callback và snapshot; item/topping hiển thị bằng component chung.
- Chỉnh tồn giữ `createInventoryDraft`, `buildInventoryChanges`, validation và idempotency hook đã có.
- Chỉnh tồn bổ sung tồn còn lại (read-only), nhập định lượng topping tùy ý và lý do bắt buộc.
- `InventoryItemCards.scss` chứa style duy nhất của card và modal, chuyển từ `ShiftInventoryModal.scss`.
- Các bản gốc được backup tại `.refactor-backup/shift-inventory-shared-ui/`.
- Chưa deploy. Phải chạy `npm run build` và test thủ công hai flow mở ca/chỉnh tồn.

## UX refinement — Topping quantity

- Bỏ ô InputNumber trùng với Segmented.
- Dùng nút chọn nhanh 0 / 0.5 / 1.
- Nếu định lượng đã lưu nằm ngoài các mức trên, hiển thị thêm giá trị hiện tại.
- Không thay đổi API hoặc logic lưu tồn kho.

## ESLint compatibility fix
- Thay globalThis.crypto bằng window.crypto.
- Giữ nguyên cơ chế tạo Idempotency-Key bằng crypto.randomUUID().

## Bước 4 — Đồng bộ UI Mở ca và Chỉnh tồn

- Cả hai modal dùng cùng card, grid và bố cục topping.
- Bỏ highlight và cột tồn kho riêng ở modal chỉnh tồn.
- Chỉ thêm ghi chú tồn còn lại, lý do và hành động lưu.
- Giữ nguyên API, Idempotency-Key và nghiệp vụ mở ca.
- Cần kiểm tra build và so sánh UI trước deploy.

## UX — Read-only remaining quantity

- Hiển thị Còn lại bên phải trường Định lượng.
- Dùng text thay vì input disabled để phân biệt với trường chỉnh sửa.
- Chỉ xuất hiện ở modal Chỉnh tồn, không ảnh hưởng Mở ca.
- Giá trị phản ánh tồn hiện tại, không tự tính theo chỉnh sửa chưa lưu.

## Menu membership correction

Edit Inventory không còn quét `getKitchenMenus` theo trang. `menuIds` phải đến từ snapshot của ca và được backend trả trong edit context; một món có thể thuộc nhiều menu đã chọn. Xem `docs/refactor/sales/step-inventory-menu-membership.md` để biết contract backend, fallback đối với ca cũ và checklist kiểm thử.

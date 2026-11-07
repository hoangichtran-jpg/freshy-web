# Freshy UI/UX V4 — Sales admission and safe shift close

## Decision

Separate *operational control* from *reconciliation*: `Bán hàng` shows a compact admission status and one Pause/Resume action with a centered confirmation modal. `Quản lý ca` offers **Đóng ca**. The backend is authoritative; a failed close may leave admission PAUSED and must not silently resume.

## Layout (Sales)

1. Page header: kitchen selector and `Chỉnh tồn kho` as the inventory action.
2. Existing tabs: `Ca hiện tại | Lịch sử ca`. Remove duplicate `Xem lịch sử ca`.
3. Compact status bar: dot/status, `Ca #... · POS và Web Order`, subtle icon refresh, short `Tạm ngừng` / `Mở lại` button. No giant card, no floating Popconfirm, no switch.
4. `AppModal`: header `Tạm ngừng nhận đơn?` / `Mở lại nhận đơn?`; body explains the scope, footer `Để sau` and explicit action. Disable while saving; keep modal on API failure.

## Close V4: decision matrix

| Request state | Behavior |
| --- | --- |
| PENDING in PG and Redis, ledger APPLIED, unpaid, no transaction | Only when BE capability is enabled: allow explicit per-request cancellation with confirmation; restore original stock, reconcile, then **explicitly** close again. |
| CHECKING, MAKING, WAITING, SHIPPING | No cancel action from close modal; close remains blocked. |
| Mixed states, paid, refunded/unknown ledger | Show error/reconciliation instructions; never bypass preflight or infer cancellation success. |
| No blockers | POST close can succeed as usual. |

`GET /close-blockers` loads only after manager clicks inspect. `GET /close-blockers/{requestId}` loads only after selecting a request; it must be a current-shift blocker. `POST /close-pending/{requestId}/cancel` is admin-only and disabled by default; do not enable on production without BE concurrency and crash recovery coverage. This is intentionally per-request, **not an automatic bulk cancel/close button**: old status transitions are not yet covered by a common distributed lock.

## Review checklist

- [ ] Pause/resume confirm centered, correct scope, no duplicate history navigation.
- [ ] PENDING request with feature disabled: no cancel action.
- [ ] PENDING unpaid with feature enabled: explicit confirmation; double-click guarded.
- [ ] Paid, CHECKING/MAKING and state mismatches: no cancel action.
- [ ] Failed cancel: show uncertainty; never retry automatically.
- [ ] After successful cancel: verify preflight and close separately.
- [ ] Switching POS/shift clears previously loaded customer detail.
- [ ] Responsive widths and keyboard focus in confirmation dialog.

### V4 – Giao diện xác nhận Pause/Resume (patch tương thích)

`OrderAdmissionCard` ở trang Doanh số sử dụng status bar gọn và **AppModal** xác nhận
Pause/Resume thay cho `Popconfirm`. Nút trạng thái có nhãn ngắn `Tạm ngừng` / `Mở lại`,
refresh là nút icon có accessible label. Thay đổi chỉ ảnh hưởng FE: thao tác vẫn gọi
`onChange("PAUSED" | "ACCEPTING")` qua hook hiện có và giữ nguyên quy tắc BE.

Khi tích hợp trên một số bản V3 có `cancelText="Đóng"` (thay vì
`cancelText="Để sau"`), dùng bản `Freshy_V4_OrderAdmissionCard_Tailored.patch`
để thay riêng component; không apply lại patch V4 đầy đủ. Trước khi merge phải chạy
Jest/build và kiểm tra giao diện thật, không chỉ preview HTML.


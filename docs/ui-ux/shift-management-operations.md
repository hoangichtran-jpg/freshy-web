> **Thiết kế lịch sử:** Quy trình kiểm tra thủ công bên dưới đã được thay thế. Xem `shift-close-click-to-check.md` (25/10/2026) để biết luồng hiện hành.

# Shift Management UI — Contract and QA

## Scope

Upgrade the existing **Quản lý ca** modal under `/manage-menu`, keeping opening
menus/inventory steps unchanged. No new page or broad architecture refactor.

## UX decisions

1. **Actual status first.** On open, read `/shifts/{posId}/ordering`; never infer
   operating status from button state. The status section uses text + shape +
   restrained color, not color alone.
2. **Pause is not cancel.** Explain that old requests remain untouched.
3. **Close is deliberate.** A read-only preflight precedes a separately confirmed
   close attempt; show blockers with reason and request code; no bulk auto-cancel.
4. **Backend owns the truth.** A 409 from the close endpoint invalidates the
   preview, reloads status, and offers a new preflight. Old previews are invalid
   after toggling pause/resume, changing shift type, POS, or reopening the modal.
5. **Fail closed.** If status fetch fails, pause/resume, open and close are disabled.

## API

| Method | URL | Purpose |
|---|---|---|
| GET | `/shifts/{posId}/ordering` | Read shift/admission snapshot |
| PUT | `/shifts/{posId}/ordering` | `{shiftId,status:"PAUSED"|"ACCEPTING"}` |
| GET | `/shifts/{posId}/close-preflight?special=false` | Read-only checks |
| POST | `/shifts/{posId}/close?special=false` | Actually close shift |

All management endpoints require admin permissions. Refresh-token behavior
comes from the shared `httpClient`. Do not print tokens to logs or docs.

Preflight fields: `shiftId, posId, ledgerCount, blockerCount, blockers,
truncated, ready`. The UI only enables Close when `ready === true`,
`blockerCount === 0`, `shiftId` matches the latest snapshot, and the selected
shift type matches the check. The backend MUST repeat validations.

## Local test plan (isolated test Redis/PostgreSQL)

1. Admin opens `/manage-menu`, selects POS with OPENED shift; status displays
   shift ID and ACCEPTING. Non-admin cannot mutate.
2. Pause → public `GET /web-order/ordering-status?posId={id}` returns
   `acceptsNewRequests=false`; attempt to place an isolated test order is rejected.
3. Resume → public status true; normal test order can be created.
4. Create a PENDING test request in the current shift. Click **Kiểm tra đóng ca**;
   blockers appear, Close remains disabled. Do not forcibly update DB/Redis.
5. Cancel test request through normal cancellation flow. Rerun preflight;
   `ready=true`; confirm Close once. API succeeds and new shift starts in default
   admission state (verify with actual API).
6. Reproduce stale response / wrong `shiftId`: button disabled until refreshed;
   backend rejects mutation without changing the current shift.
7. Check 401/403, expired token, Redis unavailable, 409 after a ready preview,
   and both shift types. Verify no silent Close on 409.
8. Run unit tests + production build + FE/BE end-to-end before deploying.

## Known boundary / safety

Existing frontend source snapshot is dated 2026-10-19; verify patch against the
current Git branch before applying. This work targets **Web Manager / POS**,
not the separate customer Web Order frontend. The public Web Order checkout UI
still needs its own status display; backend already rejects paused submissions.
No scheduler UI is in scope. Legacy requests without a shift ledger require
separate backend reconciliation, not an automatic close/cancel.

The existing flow may permit a special shift to open alongside a normal shift.
The modal does not disable the **Mở ca** button merely because a shift snapshot
is OPENED; the existing backend opening rules remain the authority. Check this
scenario during QA before production deployment.


## Cập nhật quyết định thiết kế 2026-10-25

**Thay thế bố cục cũ ở trên:** Pause/Resume không còn nằm trong modal Quản lý ca;
quản lý vận hành ở trang **Doanh số bán hàng**. Modal đóng ca chỉ hiển thị số blocker
sau preflight, sau đó người quản lý có thể chọn **Xem danh sách** (đơn vị + địa chỉ),
chọn từng request để xem món/topping/thanh toán. Hai API BE mới chỉ đọc, có kiểm tra
quyền và cùng ca. Xem tài liệu chuẩn mới: `shift-close-progressive-disclosure.md`.

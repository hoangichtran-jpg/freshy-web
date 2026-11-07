# Freshy Web Manager — Chốt ca theo hành động (25/10/2026)

**Trạng thái:** UI review candidate. Tài liệu này là nguồn sự thật cho bản patch UI mới,
**thay thế hướng dẫn kiểm tra thủ công** trong `shift-management-operations.md`
và `shift-close-progressive-disclosure.md` (hai file này ghi lại lịch sử thiết kế).

## Quyết định giao diện

- Trang **Bán hàng** giữ **Tạm ngừng / Tiếp tục nhận đơn**. Đây là trạng thái
  admission của POS, không phải một phần của thao tác đóng ca.
- Modal Quản lý ca (**~500px**, màu trung tính ấm, sử dụng `AppModal` + `AppButton`)
  chỉ có một CTA theo trạng thái: **Mở ca** nếu chưa có ca; **Đóng ca** nếu có ca.
- Ẩn lựa chọn **Ca đặc biệt** (UI chỉ đóng ca thường, gửi `special=false`);
  không xóa khả năng xử lý ca đặc biệt ở backend.
- Không hiển thị nút **Kiểm tra đóng ca**. Nhấn **Đóng ca** gửi
  `POST /shifts/{posId}/close?special=false` một lần; backend kiểm tra điều kiện.
  Hiển thị loading **Đang kiểm tra...**, khóa nút trong lúc xử lý.

## Trạng thái và nội dung

| Tình huống | Giao diện | Nội dung |
|---|---|---|
| Đóng ca thành công | Shared `AppToast` | `Đóng ca thành công` · `Ca #... đã được đóng.` |
| HTTP 409 `SHIFT_HAS_UNRESOLVED_REQUESTS` và preflight xác nhận blocker PENDING thuộc ca hiện tại | `ShiftCloseBlockersModal` riêng | `Còn N đơn chưa hoàn tất`, `Xem danh sách đơn`, `Kiểm tra lại` |
| HTTP 409 bất kỳ khác, HTTP 412, 403, 404, 5xx, lỗi mạng, preflight không xác nhận được PENDING | Modal thông báo tái sử dụng `AppModal` | `Chưa thể đóng ca` + diễn giải ngắn, `Đã hiểu` |
| Chưa tải xong snapshot / không xác định ca | CTA bị khóa | Không đoán ca hoặc cho đóng từ dữ liệu cũ |

**Lưu ý an toàn:** Một lần đóng ca không thành công có thể để admission ở
`PAUSED`. Modal đơn tồn hiện lời nhắc nếu snapshot mới nhất xác nhận PAUSED;
không tự động `ACCEPTING` khi đóng ca thất bại.

## Modal đơn tồn (Progressive Disclosure)

1. **Cảnh báo:** Chỉ hiển thị tổng số đơn và lý do chặn; không tải địa chỉ/khách.
2. **Xem danh sách đơn:** `GET /shifts/{posId}/close-blockers?special=false`;
   nhóm theo **đơn vị + địa chỉ**. Card nhóm gập/mở, cho thấy mỗi request.
3. **Chọn một request:** `GET /shifts/{posId}/close-blockers/{requestId}?shiftId=...&special=false`;
   hiển thị món, topping, ghi chú, người đặt, số tiền và trạng thái thanh toán.

Không xử lý/hủy đơn ngay từ modal này. Không hiển thị data cũ nếu POS/shift
đã đổi. Nút **Kiểm tra lại** (chỉ sau khi gặp PENDING) gọi GET preflight; nếu
`ready:true` thì quay về modal chính để quản lý **bấm Đóng ca một lần nữa**.
Không tự POST /close khi chỉ bấm Kiểm tra lại.

## Điều kiện xác định PENDING

Chỉ mở explorer khi tất cả điều kiện đúng:

- HTTP 409 và mã lỗi `SHIFT_HAS_UNRESOLVED_REQUESTS`.
- GET preflight thành công, `shiftId` khớp với snapshot ở thời điểm POST.
- `ready=false`, `blockerCount > 0`, `blockers` có phần tử, mọi blocker trả về
  có `databaseStatus=PENDING` hoặc `redisStatus=PENDING`.

Nếu có blocker không phải PENDING hoặc thiếu bằng chứng, hiện modal lỗi bình
thường, không tự suy diễn là đơn tồn. BE vẫn quyết định cuối cùng ở POST.

## File chính

- `features/kitchen-menu/components/ShiftActionModal/*`: CTA đóng/mở ca.
- `features/kitchen-menu/components/ShiftCloseBlockersModal/*`: modal riêng ba cấp.
- `features/kitchen-menu/pages/KitchenMenuPage/index.js`: phân nhánh response.
- `features/kitchen-menu/utils/shiftCloseFlow.js`: phân loại lỗi thuần (unit-testable).
- `features/sales/components/OrderAdmissionCard*`: Pause/Resume, không đổi.

## Kiểm thử

```bash
CI=true npm test -- --watch=false --runInBand \
  src/features/kitchen-menu/utils/shiftCloseFlow.test.js \
  src/features/kitchen-menu/components/ShiftActionModal/ShiftActionModal.test.js \
  src/features/kitchen-menu/components/ShiftCloseBlockersModal/ShiftCloseBlockersModal.test.js \
  src/features/kitchen-menu/utils/closeBlockers.test.js \
  src/features/kitchen-menu/api/kitchenMenu.api.test.js
npm run build
git diff --check
```

QA trong local/staging bằng Redis + PostgreSQL cách ly: ca OPENED không blocker
đóng thành công; PENDING thì 409 + explorer, sau xử lý retry và POST đóng;
409 khác/412/500 hiển thị modal lỗi; mất kết nối GET/POST giữ trạng thái an
toàn; đổi POS sau lỗi không hiển thị đơn ca trước; responsive 375/768/1440px.

**Yêu cầu backend trước khi test end-to-end:** `close-blockers` và
`close-blockers/{requestId}` đã deploy; không thử đóng ca trên production.

## V3 — Refined blocker summary (duyệt giao diện 25/10/2026)

Thay cho layout cảnh báo nhiều tầng ở bản V2. **Không đổi endpoint hoặc quy tắc
đóng ca**. Khi POST đóng ca nhận 409 và preflight xác thực tất cả blocker là
PENDING của cùng ca, mở modal chuyên biệt theo thứ tự ưu tiên:

1. **Header:** `QUẢN LÝ CA · ĐÓNG CA` / `Chưa thể đóng ca` / `{đơn vị đang chọn} · Ca #{id}`.
2. **Một cảnh báo vàng nhạt:** `Còn 1 đơn chưa hoàn tất` và hướng dẫn xử lý;
   nhiều đơn dùng `Còn N đơn chưa hoàn tất`. Không lặp cảnh báo bằng khối khác.
3. **Một navigation row:** `Xem đơn cần xử lý` (1 đơn, hiển thị `requestId`
   nếu đã có từ preflight) hoặc `Xem danh sách đơn` (N đơn). Chỉ khi bấm mới
   gọi API tóm tắt và nhóm theo đơn vị + địa chỉ. Chọn request mới tải chi tiết.
4. **Ghi chú phụ không nền xanh:** Chỉ render khi snapshot mới xác nhận
   `PAUSED`; nhắc việc có thể mở lại tại trang Bán hàng. Tuyệt đối không tự
   resume khi đóng ca bị chặn.
5. **Footer:** `Để sau` (secondary) / `Kiểm tra lại` (primary).
   `Kiểm tra lại` chỉ gọi GET preflight và không tự POST đóng ca. Khi không còn
   blocker quay về modal đóng ca để người quản lý xác nhận lại.

- Modal summary tối đa 480px, mobile thu gọn theo chiều ngang; màn danh sách /
  chi tiết dùng 660px. Giảm đường viền mạnh và nhiều card màu khác nhau.
- Keyboard focus trên navigation row, các request và nhóm có outline rõ ràng;
  nút điều hướng là `<button>`, không dùng div có `onClick`.
- Nếu preflight chưa cung cấp `requestId`, hiện helper text trung tính, không
  suy diễn mã đơn. Chỉ dùng preflight ID có sẵn, không tải khách/địa chỉ sớm.
- Lỗi khác giữ nguyên modal thông báo lỗi đang có; không chuyển thành danh sách
  `PENDING` nếu không thể xác thực từ preflight.

### Acceptance tests V3

- 1 request: số ít đúng chính tả, link `Xem đơn cần xử lý`, chưa gọi API list/detail.
- N requests: số nhiều, link `Xem danh sách đơn` và nhóm địa chỉ chỉ tải khi bấm.
- `PAUSED`: chỉ hiển thị inline note khi đã xác nhận status, không thêm card xanh.
- Back / Refresh: không thay đổi ngữ nghĩa hoặc quyền của backend; không tự đóng ca.

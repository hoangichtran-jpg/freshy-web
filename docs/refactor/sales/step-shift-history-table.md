# Shift History UI

- Bỏ tên ca khỏi bảng và Drawer.
- Thêm STT liên tục qua phân trang (20 dòng/trang).
- Hiển thị ngày giờ bắt đầu/kết thúc: DD/MM/YYYY HH:mm.
- Trạng thái hiển thị bằng tiếng Việt.
- Ca chưa đóng hiển thị "Chưa kết thúc".
- Giữ shiftId nội bộ để mở chi tiết.
- Không thay đổi API hoặc database.
- Cần kiểm tra build và responsive.

## Timezone — Việt Nam

- Giả định timestamp không có múi giờ từ backend là UTC.
- Parse bằng dayjs.utc().
- Hiển thị bằng Asia/Ho_Chi_Minh (UTC+7).
- Áp dụng cho lịch sử ca và thời gian audit.
- Không cập nhật dữ liệu PostgreSQL.
- Cần xác nhận múi giờ JVM production.

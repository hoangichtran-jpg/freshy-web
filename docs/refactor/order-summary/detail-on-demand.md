# Order Summary — Detail on demand

## Flow
- Click dòng đơn → mở modal loading.
- GET /orders/{orderId}/detail?posId=...
- Response từ PostgreSQL → hiển thị chi tiết.
- Lỗi → thông báo + nút Thử lại.
- Đổi POS, đóng modal, click đơn khác → bỏ qua response cũ.

## Typography
- Nội dung chính: 16px.
- Text phụ: 14px.
- Metadata: 13px.
- Tiêu đề trang giữ nguyên.

## Verification
- Deploy backend trước frontend.
- Test đơn FINISHED, không có quyền, không tồn tại.
- Test đóng modal / đổi POS khi request chưa xong.
- Kiểm tra request items và thanh toán.

# Shift History Detail UI

## Danh sách món
- Chỉ hiển thị Tên món / Ban đầu / Đã bán / Doanh thu.
- Bỏ Còn lại, Định lượng và nút mở rộng topping.
- Đã bán lấy từ totalItem của ca đã đóng.
- Ca OPENED chưa chốt totalItem nên không hiển thị số giả.
- Backend hiện chưa trả revenue theo món. UI hiện dấu —.

## Lịch sử chỉnh sửa
- Dùng nhãn tiếng Việt cho loại thay đổi.
- Hiển thị rõ người sửa, món/topping, trước/sau và lý do.
- Bổ sung tổng quan ca và thống kê số thay đổi.

## Backend cần bổ sung
- GET /shifts/history/{shiftId}: items[].revenue
- Doanh thu món phải tính từ dữ liệu giao dịch thực tế.
- Không lấy giá bán hiện tại nhân số lượng.
- Không tự phân bổ totalPrice của cả ca.

## Verification
- npm run build.
- Kiểm tra ca OPENED và CLOSED.
- Kiểm tra responsive và bảng không còn expandable topping.
- Giữ nguyên xử lý múi giờ Việt Nam hiện có.

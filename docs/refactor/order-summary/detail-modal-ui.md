# Order Summary Detail — UI Redesign

## Mục tiêu
- Ưu tiên danh sách món, yêu cầu và tổng tiền.
- Phân biệt thông tin đơn tổng với từng người yêu cầu.
- Không thêm ảnh món, hóa đơn hoặc hành động không có API.
- Không thay đổi GET detail, loading, retry hoặc thanh toán.

## Layout
- Modal rộng tối đa 1180px.
- Desktop: hai cột, món và yêu cầu chiếm vùng lớn hơn.
- Tablet/mobile: một cột.
- Font tên món 16px, nhãn phụ 13–14px.
- Tổng tiền là điểm nhấn chính.

## Kiểm thử
- npm run build.
- Click đơn FINISHED, kiểm tra loading và retry.
- Nhiều request, topping dài, ghi chú có/không.
- Responsive 390px và 768px.
- Đóng modal khi request còn đang tải.

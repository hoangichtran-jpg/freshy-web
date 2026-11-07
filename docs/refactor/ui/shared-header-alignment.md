# Shared Header Alignment

## Vấn đề
- Header căn đáy bằng align-items: flex-end.
- AppSelect chỉ đặt chiều cao cho selector bên trong.
- Select và Button lệch vị trí trên nhiều trang.

## Giải pháp
- ManagementPageHeader căn giữa theo trục dọc.
- AppSelect root và inner selector sử dụng cùng
  biến --app-select-height.
- Giữ nguyên size sm/md/lg (36/42/44px).
- Không override từng trang.

## Kiểm tra
- Thực đơn bếp.
- Tổng hợp đơn hàng.
- Doanh số bán hàng.
- Responsive desktop/mobile.
- npm run build.

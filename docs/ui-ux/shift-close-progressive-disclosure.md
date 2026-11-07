> **Thiết kế lịch sử:** Quy trình kiểm tra thủ công bên dưới đã được thay thế. Xem `shift-close-click-to-check.md` (25/10/2026) để biết luồng hiện hành.

# Freshy — Đóng ca theo 3 cấp (Progressive Disclosure)

**Quyết định:** Không hiển thị tên khách/địa chỉ ngay trong modal đóng ca. Phân tách thao tác ngừng nhận đơn (màn Bán hàng) với đối soát đóng ca (màn Quản lý ca).

1. Tổng quan: Kiểm tra preflight, hiện số blocker; nút Đóng ca bị khóa nếu chưa sẵn sàng.
2. Xem danh sách (lazy): tải 40 tóm tắt tối đa, nhóm theo đơn vị + địa chỉ; danh sách request trong từng nhóm.
3. Xem chi tiết (lazy): chỉ tải một request thuộc ca đang đóng; các món, topping, ghi chú, tổng tiền và thanh toán.

Có nút quay lại; khi đổi POS/ca/loại ca hoặc đóng modal, dữ liệu chi tiết cũ phải bị loại bỏ. Nếu API lỗi hay trả ca khác, không đưa ra quyết định đóng ca từ FE. Backend đóng ca luôn kiểm tra lại. Không có chức năng sửa/hủy dữ liệu từ màn đối soát.

**Giới hạn:** Backend list hiện trả tối đa 40 blocker, cần phân trang nếu triển khai quy mô lớn. Frontend đòi hai API companion; phải phát hành BE tương ứng trước. Không sử dụng cùng Redis/PostgreSQL production khi test thao tác Pause hoặc Close.

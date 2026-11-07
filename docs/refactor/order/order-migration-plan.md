# Web Order Refactor & Migration Plan

## Mục tiêu

Refactor Web Order sang feature-based architecture trước khi redesign UI/UX.

Trong phase refactor đầu tiên, yêu cầu quan trọng nhất là:

> **Behavior và UI hiện tại phải được giữ nguyên.**

## Current ownership

Hiện tại Web Order phân tán chủ yếu tại:

```text
src/pages/OrderTabs/index.js
src/components/OrderDetailModal/
src/components_new/body_header/order/
src/services/order.js
src/services/index.js
```

`OrderTabs` hiện đang đảm nhiệm đồng thời:

- fetch POS/kitchen;
- fetch orders;
- tab/status state;
- kitchen filtering;
- search;
- order mutations;
- selected order/modal state;
- table columns;
- render page.

Đây là lý do cần tách responsibility trước khi redesign.

## Target ownership

```text
src/features/orders/
├── api/
├── components/
├── constants/
├── hooks/
├── pages/
├── utils/
└── README.md
```

## Migration steps

### Step 1 — Architecture skeleton ✅

- tạo `app/`, `features/orders/`, `shared/`;
- document architecture;
- không thay implementation đang chạy.

### Step 2 — Order constants

- tách status và tab metadata khỏi `OrderTabs`;
- phân biệt constant/config với React state;
- chưa thay behavior.

### Step 3 — Order API

- tạo API module thuộc feature;
- migrate dần dependency khỏi giant `services/index.js` config object;
- giữ API contract hiện tại.

### Step 4 — `useOrders`

- tách fetching/filtering/loading state;
- giữ render hiện tại.

### Step 5 — `useOrderActions`

- tách confirm/cancel/finish mutations và state update liên quan.

### Step 6 — UI component extraction

- OrderStatusTabs;
- OrderTable;
- các phần presentation phù hợp.

### Step 7 — Order Detail ownership

- chuyển Order Detail vào feature;
- làm rõ single source of truth;
- chưa redesign modal trong bước migrate ownership.

### Step 8 — `OrdersPage`

- page chỉ còn orchestration;
- feature trở thành owner của Web Order implementation.

### Step 9 — Route switch

- route trỏ sang `features/orders/pages/OrdersPage`;
- verify behavior.

### Step 10 — Legacy cleanup

- xóa code Order legacy không còn được import;
- cập nhật docs.

## Sau refactor: UX redesign phase

Chỉ bắt đầu sau khi migration architecture ổn định:

1. Order page hierarchy;
2. operational status navigation;
3. Order list/table;
4. modal detail → side detail panel (nếu UX validation xác nhận);
5. inline/edit mode;
6. loading/empty/error;
7. responsive và micro-interactions.

## Definition of Done cho từng step

- chỉ thay đúng scope;
- không làm UI/business behavior đổi ngoài chủ đích;
- app/build vẫn hoạt động;
- docs + README cập nhật cùng step;
- migration plan đánh dấu trạng thái;
- commit message mô tả được mục đích thay đổi.

# Frontend Architecture

## 1. Mục tiêu

Codebase hiện tại chủ yếu tổ chức theo loại file: `pages`, `components`, `services`. Cách này dễ bắt đầu nhưng khi business lớn lên, code của một domain như Order bị phân tán ở nhiều nơi.

Architecture mới tổ chức theo **business feature** để một thay đổi về Order có thể được hiểu và xử lý chủ yếu trong `src/features/orders`.

## 2. Target structure

```text
src/
├── app/
│   ├── providers/
│   └── routes/
│
├── features/
│   └── orders/
│       ├── api/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── pages/
│       ├── utils/
│       └── README.md
│
└── shared/
    ├── components/
    ├── constants/
    ├── hooks/
    └── utils/
```

## 3. Responsibility của từng layer

### `app/`

Chứa composition cấp ứng dụng: app providers, routing composition và wiring giữa các feature. Không chứa business logic của Order/Menu/Customer.

### `features/<feature>/`

Chứa code thuộc một business domain.

Ví dụ `features/orders/`:

- `api/`: request/adapter riêng của Order;
- `components/`: UI chỉ có ý nghĩa trong Order;
- `constants/`: status, labels, business configuration;
- `hooks/`: state/data orchestration của Order;
- `pages/`: page-level composition;
- `utils/`: pure functions đặc thù Order.

### `shared/`

Chỉ chứa code không biết business domain cụ thể và được nhiều feature sử dụng thực tế.

Ví dụ có thể là generic Button, EmptyState hoặc debounce hook. `OrderStatusBadge` **không** phải shared vì nó biết Order status.

## 4. Dependency direction

Hướng dependency mong muốn:

```text
app
 ↓
features
 ↓
shared
```

- `shared` không import từ `features`.
- một feature không import implementation nội bộ của feature khác nếu chưa có contract rõ ràng.
- page/component không nên gọi trực tiếp một giant `config` object khi API layer đã được migrate.

## 5. Migration strategy

Không rewrite toàn bộ source.

Trong quá trình migrate, legacy và architecture mới tồn tại song song:

```text
legacy implementation  ────── migrate dần ──────>  features/*
```

Mỗi step phải nhỏ, testable và có thể revert độc lập.

## 6. Anti-patterns cần tránh

Không tạo:

```text
components_new/
components_v2/
orders_new/
orders_final/
```

Không đưa component vào `shared` chỉ vì "có thể sau này dùng lại".

Không vừa move architecture, vừa đổi business logic, vừa redesign UI trong cùng một step.

## 7. Documentation rule

Mỗi refactor step phải cập nhật documentation trong cùng commit. Nếu architecture, ownership hoặc migration status thay đổi mà docs chưa đổi thì step chưa hoàn thành.

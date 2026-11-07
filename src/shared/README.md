# Shared Layer

`shared/` dành cho code generic được nhiều feature sử dụng thực tế.

Nguyên tắc:

> **shared is earned, not predicted**

Mặc định code ở lại feature của nó cho tới khi có nhu cầu tái sử dụng rõ ràng.

---

## What belongs here

Shared code should be:

- generic enough to have the same meaning across features;
- already used by multiple real consumers;
- free from private feature internals.

Examples:

```text
shared/components/ConfirmModal
shared/hooks/useKitchens
```

---

## What does not belong here

Do not put code in `shared/` only because it may be reusable later.

Examples that should remain feature-owned:

```text
OrderTable
OrderDetail
SalesSummaryStats
useShiftSummary
```

These carry business meaning that belongs to a specific feature.

---

## Shared hooks

### `useKitchens`

Location:

```text
src/shared/hooks/useKitchens.js
```

Current consumers:

```text
features/orders
legacy Sales page during migration
```

Responsibilities:

- load POS/kitchen options for the manager;
- own the selected kitchen ID;
- expose the selected kitchen;
- derive POS IDs;
- derive the selected kitchen display name;
- expose loading/error state;
- expose the selection action.

The source of truth is:

```text
selectedKitchenId
```

Derived values are not stored as independent synchronized state.

This hook was promoted to shared only after Sales became a second real consumer of the same lifecycle.

# Step 08 — Orders Page

## What changed

The legacy OrderTabs page was migrated into:

`features/orders/pages/OrdersPage`

The old page path now acts as a compatibility bridge.

## Responsibilities

OrdersPage now focuses on orchestration:

- current status
- selected order
- composing order UI
- displaying page-level notifications

## Extracted logic

Kitchen/POS loading is handled by:

`useOrderKitchens`

Order loading is handled by:

`useOrders`

Order mutations are handled by:

`useOrderActions`

Filtering/search is handled by:

`useOrderFilters`

## State cleanup

Redundant modal visibility state and obsolete cancel
confirmation state were removed.

`selectedOrder` is now the source of truth for whether
OrderDetail is open.

## Compatibility

Routes still import the legacy OrderTabs path.

The route will be switched directly to OrdersPage in
Step 09.
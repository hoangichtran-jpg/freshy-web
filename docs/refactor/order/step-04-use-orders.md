# Step 04 — useOrders

## What changed

Order fetching and order collection state moved from `OrderTabs`
into `features/orders/hooks/useOrders.js`.

The hook now owns:

- order fetching
- loading state
- error state
- refetching
- derived current orders
- moving orders between statuses

## Why

`OrderTabs` should orchestrate the screen instead of owning
server-data lifecycle and internal order state structure.

## Encapsulation

Before:

OrderTabs
→ setOrdersByTab(...)

After:

OrderTabs
→ moveOrder(...)

The page expresses intent while the hook owns the state representation.

## Result

`OrderTabs` no longer owns order fetching state directly.
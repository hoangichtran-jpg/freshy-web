# Step 06 — Order UI Components

## What changed

Large UI sections were extracted from `OrderTabs`
into Order feature components.

Extracted:

- OrderHeader
- OrderStatusTabs
- OrderTable

Order filtering was moved into `useOrderFilters`.

## Responsibility split

OrderTabs
→ page orchestration

OrderHeader
→ toolbar / search / kitchen controls

OrderStatusTabs
→ order status navigation

OrderTable
→ order list presentation

useOrderFilters
→ search and kitchen filtering logic

## Compatibility

The legacy `components_new` OrderHeader path remains
as a temporary compatibility bridge.

It should be removed during legacy cleanup.

## Result

OrderTabs is now primarily responsible for composing
Order feature pieces rather than implementing them directly.
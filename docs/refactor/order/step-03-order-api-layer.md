# Step 03 — Order API Layer

## What changed
- Order APIs moved toward features/orders/api.
- OrderTabs no longer depends on giant config for Order operations.
- changeOrderStatus and sendOrderToPos are separated.
- services/order.js acts as a legacy compatibility bridge.

## Why
- Make dependencies explicit.
- Keep Order ownership inside the Order feature.
- Avoid duplicate API implementations.
- Preserve backward compatibility during migration.

## Architecture
OrderTabs
→ features/orders/api
→ httpRequest
→ Backend

Legacy consumer
→ services/order.js
→ features/orders/api

## Result
Step 3 completed without changing UI behavior.
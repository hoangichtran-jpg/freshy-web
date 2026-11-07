# Sales Migration Plan

## Context

The current sales page is located at:

```text
src/pages/OrderSummary/
```

Its legacy name is misleading.

The page represents:

```text
Doanh số bán hàng
```

and works with shift / POS sales information rather than the Order lifecycle.

The target ownership is:

```text
src/features/sales/
```

The target page name is:

```text
SalesSummaryPage
```

---

## Current status

```text
Step 1   Feature boundary + documentation       DONE
Step 2   Sales API layer                        DONE
Step 3   POS / kitchen selection lifecycle      NEXT
Step 4   useShiftSummary                        PENDING
Step 5   Edit initial quantity action           PENDING
Step 6   Presentation components                PENDING
Step 7   SalesSummaryPage                       PENDING
Step 8   Route switch                           PENDING
Step 9   Legacy cleanup                         PENDING
Step 10  UI/UX redesign                         PENDING
```

---

# Goals

1. give the Sales domain clear ownership;
2. remove Sales-specific business logic from legacy `pages/`;
3. move HTTP access into the feature API layer;
4. move data lifecycle into feature hooks;
5. keep the page focused on composition;
6. make UI redesign possible without mixing it with architecture migration;
7. preserve current behavior during structural migration.

---

# Non-goals during migration

Until structural migration is complete, do not:

- redesign the dashboard;
- add charts only for visual improvement;
- change backend contracts;
- rename backend fields unnecessarily;
- change the `/order-summary` URL;
- refactor unrelated Order behavior;
- refactor `OrderSummaryManage`;
- create generic shared abstractions speculatively.

---

# Step 1 — Feature boundary + documentation

Status:

```text
DONE
```

Created the Sales feature boundary and documented domain ownership.

No runtime behavior was changed.

---

# Step 2 — Sales API layer

Status:

```text
DONE
```

Moved HTTP ownership for:

```text
getShiftSummary
updateShiftItemsQuantity
```

into:

```text
src/features/sales/api/
```

The feature API uses normal Promise semantics:

```text
success → return data
failure → throw
```

`src/services/shift.js` temporarily remains as a compatibility bridge for legacy consumers.

The route and visible Sales page remain unchanged.

---

# Step 3 — POS / kitchen selection lifecycle

Status:

```text
NEXT
```

Goals:

- remove duplicated state describing the selected POS;
- identify one source of truth;
- reuse generic POS/kitchen selection behavior across real consumers;
- avoid Sales depending on private Orders hooks.

---

# Step 4 — `useShiftSummary`

Status:

```text
PENDING
```

Create:

```text
src/features/sales/hooks/useShiftSummary.js
```

It will own:

- summary data;
- loading;
- error;
- fetching;
- refresh behavior.

---

# Step 5 — Edit initial quantity action

Status:

```text
PENDING
```

Move edit-initial-quantity mutation behavior away from page JSX.

---

# Step 6 — Presentation components

Status:

```text
PENDING
```

Possible feature components:

```text
SalesSummaryStats
SalesItemsTable
EditInitialQuantityModal
```

Exact extraction follows responsibility, not arbitrary file size.

---

# Step 7 — `SalesSummaryPage`

Status:

```text
PENDING
```

Create the feature page and make it an orchestration layer.

---

# Step 8 — Route switch

Status:

```text
PENDING
```

Switch the existing runtime route to `SalesSummaryPage`.

Keep the current URL initially:

```text
/order-summary
```

---

# Step 9 — Legacy cleanup

Status:

```text
PENDING
```

Remove obsolete Sales legacy code and temporary compatibility bridges that no longer have consumers.

---

# Step 10 — UI/UX redesign

Status:

```text
PENDING
```

Only redesign after data flow and ownership are stable.

---

# Definition of Done

The Sales migration is complete when:

- runtime Sales code lives under `src/features/sales`;
- the page does not own low-level HTTP access;
- feature hooks own Sales data lifecycle;
- Sales-specific UI is feature-owned;
- route points to `SalesSummaryPage`;
- legacy Sales implementation is removed;
- behavior remains correct;
- build succeeds;
- documentation matches final architecture.

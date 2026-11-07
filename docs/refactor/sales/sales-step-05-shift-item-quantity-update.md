# Sales Refactor — Step 05

## Shift Item Initial Quantity Mutation

Date:

```text
2026-10-09
```

---

## Objective

Move the edit-initial-quantity mutation lifecycle out of the legacy Sales page and into Sales-owned feature code.

Target:

```text
src/features/sales/hooks/useShiftItemQuantityUpdate.js
```

---

## Problem before Step 5

The legacy page still owned:

```text
buildMenuItemUpdateDTOs
updateShiftItemsQuantity API call
mutation success/failure control flow
refresh coordination
```

This mixed presentation with mutation/business behavior.

The page also still depended on the legacy service object for the update call.

---

## Decision

Create:

```text
useShiftItemQuantityUpdate
```

The hook owns the mutation lifecycle.

The page remains responsible for:

- opening/closing the modal;
- editable input state;
- success notification;
- error notification.

Those are presentation concerns and will be extracted with UI components in Step 6.

---

## Hook responsibilities

`useShiftItemQuantityUpdate` owns:

- mapping editable items into API DTOs;
- mutation loading state;
- mutation error state;
- calling `updateShiftItemsQuantity`;
- refreshing the current shift summary after success;
- rethrowing failures to the caller.

---

## DTO transformation

Editable UI rows use:

```text
itemId
menuItemId
quantity
```

The API expects:

```text
itemId
menuItemId
newInitialQuantity
```

That transformation is business/API boundary behavior and no longer belongs in the page.

---

## Dependency direction

Before:

```text
Legacy Sales page
      ↓
legacy services config
      ↓
compatibility bridge
      ↓
Sales API
```

After:

```text
Legacy Sales page
      ↓
useShiftItemQuantityUpdate
      ↓
Sales API
      ↓
HTTP
```

The legacy Sales page no longer imports the legacy services object for summary/update behavior.

---

## Mutation and read lifecycle

Read lifecycle:

```text
useShiftSummary
```

Mutation lifecycle:

```text
useShiftItemQuantityUpdate
```

After mutation success:

```text
update
→ await refreshSummary()
→ server becomes authoritative source
```

The hook does not manually mutate `shiftSummary`.

---

## Error handling

The mutation hook:

1. clears the previous mutation error;
2. starts loading;
3. calls the feature API;
4. stores the error on failure;
5. rethrows the error;
6. always clears loading.

Rethrowing lets presentation code decide whether to show:

- notification;
- inline validation;
- modal error state;
- another UX treatment.

---

## Loading behavior

The hook exposes:

```text
updating
```

The legacy modal uses this as:

```text
confirmLoading
```

This prevents duplicate submissions and makes the existing UI reflect mutation progress.

---

## Files added

```text
src/features/sales/hooks/useShiftItemQuantityUpdate.js
```

## Files modified

```text
src/features/sales/hooks/index.js
src/pages/OrderSummary/index.js
src/features/sales/README.md
README.md
docs/refactor/sales-migration-plan.md
```

---

## Runtime behavior

No route change.

No dashboard redesign.

No backend contract change.

The existing Sales page should still:

- open the edit modal;
- edit initial quantities;
- save;
- show loading while saving;
- close after success;
- refresh summary;
- show an error notification on failure.

---

## Verification

1. Open `/order-summary`.
2. Open a shift with items.
3. Open the initial quantity modal.
4. Change one or more values.
5. Save.
6. Confirm the OK button shows loading.
7. Confirm duplicate submit is prevented while saving.
8. Confirm success notification appears.
9. Confirm modal closes.
10. Confirm summary refreshes from the server.
11. Force an update error and confirm the modal remains open.
12. Confirm error notification appears.
13. Run the build.

---

## Architecture lesson

Mutation behavior belongs with domain lifecycle, not in page JSX.

Preferred direction:

```text
Page
 ↓
Mutation hook
 ↓
Feature API
```

The page decides how the result is presented.

The hook decides how the mutation is executed.

---

## Next step

Step 6 will extract the existing Sales UI into feature-owned presentation components without redesigning it.

Expected responsibilities:

```text
SalesSummaryStats
SalesItemsTable
EditInitialQuantityModal
```

The goal is ownership extraction, not visual polish.

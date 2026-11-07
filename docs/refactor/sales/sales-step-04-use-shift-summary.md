# Sales Refactor — Step 04

## `useShiftSummary`

Date:

```text
2026-10-09
```

---

## Objective

Move shift-summary read lifecycle out of the legacy Sales page and into a Sales-owned hook.

Target:

```text
src/features/sales/hooks/useShiftSummary.js
```

---

## Problem before Step 4

The legacy page owned all of the following:

```text
shiftSummary
loading
fetchSummary
fetch effect
fetch error handling
```

That made the page responsible for both:

```text
orchestration
+
data lifecycle
```

The page also depended on the legacy service path for reading shift summary.

---

## Decision

Create:

```text
src/features/sales/hooks/useShiftSummary.js
```

The hook becomes the owner of shift-summary read state.

The page consumes the hook and remains responsible only for displaying loading/error feedback and composing UI.

---

## Hook responsibilities

`useShiftSummary(posId)` owns:

- `shiftSummary`;
- `loading`;
- `error`;
- initial fetch;
- automatic refetch when `posId` changes;
- manual `refresh`;
- resetting state when no POS is selected;
- ignoring stale responses.

---

## Dependency direction

Before:

```text
Legacy Sales page
      ↓
legacy service
      ↓
Sales API compatibility bridge
      ↓
HTTP
```

After:

```text
Legacy Sales page
      ↓
useShiftSummary
      ↓
Sales API
      ↓
HTTP
```

The page no longer uses the legacy service for summary reads.

This is still an intermediate migration state because the final page has not moved into the Sales feature yet.

---

## Error ownership

The hook stores the actual error:

```text
error
```

It does not display Ant Design notifications.

Notification is presentation behavior and remains in the page for now.

This separation lets future consumers decide how errors should be presented.

---

## Stale request protection

Changing POS can trigger overlapping requests.

Example:

```text
POS A request starts
→ user selects POS B
→ POS B request starts
→ POS B returns
→ POS A returns later
```

Without protection, the late POS A response could overwrite POS B data.

`useShiftSummary` tracks request identity and ignores responses from obsolete requests.

---

## Summary state ownership

After Step 4:

```text
useShiftSummary
```

is the only owner of `shiftSummary`.

The page does not receive or expose a raw state setter.

After an update operation, the page calls:

```text
refresh()
```

to retrieve authoritative server state.

This also removes the old transient behavior where the page assigned the mutation response to `shiftSummary` even though the response did not have the same data shape.

The mutation itself still remains in the page until Step 5.

---

## Files added

```text
src/features/sales/hooks/useShiftSummary.js
src/features/sales/hooks/index.js
```

## Files modified

```text
src/pages/OrderSummary/index.js
src/features/sales/README.md
README.md
docs/refactor/sales-migration-plan.md
```

## Files removed

```text
src/features/sales/hooks/.gitkeep
```

---

## Runtime behavior

No route changes.

No dashboard redesign.

No backend contract changes.

The existing Sales screen should continue to:

- select a kitchen;
- load its summary;
- show loading state;
- show the no-open-shift state;
- edit initial quantity;
- refresh after an update.

---

## Verification

1. Open `/order-summary`.
2. Confirm the first kitchen loads.
3. Change kitchen and confirm the summary follows the new POS.
4. Switch kitchens quickly several times and confirm stale data does not flash back.
5. Trigger a summary API failure and confirm the error notification still appears.
6. Edit initial quantity and confirm summary refreshes afterward.
7. Run the build.

---

## Architecture lesson

A page should not own data transport lifecycle simply because it renders the data.

Preferred direction:

```text
Page
 ↓
Feature hook
 ↓
Feature API
```

The page orchestrates.

The hook owns stateful domain lifecycle.

The API owns transport.

---

## Next step

Step 5 will extract the edit-initial-quantity mutation from the page.

The target will remove:

```text
edit mutation API call
DTO construction
mutation loading/error lifecycle
```

from page-level business logic while keeping modal presentation separate.

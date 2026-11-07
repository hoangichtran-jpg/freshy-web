# Sales Refactor — Step 02

## Sales API Layer

Date:

```text
2026-10-09
```

---

## Objective

Move HTTP ownership for Sales shift-summary operations from the legacy service layer into:

```text
src/features/sales/api/
```

without breaking existing runtime consumers.

---

## Scope

Step 2 migrates:

```text
getShiftSummary
updateShiftItemsQuantity
```

It does not migrate:

```text
openShift
closeShift
openShiftV2
```

Those operations participate in other application flows and are outside this step.

---

## Before

HTTP ownership lived in:

```text
src/services/shift.js
```

Runtime flow:

```text
Legacy page
    ↓
services/index.js
    ↓
services/shift.js
    ↓
HTTP endpoint
```

---

## After

Sales-specific HTTP ownership lives in:

```text
src/features/sales/api/
├── index.js
└── shiftSummary.api.js
```

New ownership:

```text
features/sales
      ↓
api
      ↓
HTTP
```

Legacy consumers temporarily use:

```text
Legacy page
    ↓
services/index.js
    ↓
services/shift.js
    ↓
features/sales/api
    ↓
HTTP
```

---

## Why keep the legacy bridge?

Existing consumers still use:

```text
config.getShiftSummary(...)
config.updateShiftItemsQuantity(...)
```

Changing all consumers in Step 2 would expand the migration scope.

`src/services/shift.js` therefore temporarily adapts the feature API to the old contract.

There is still only one real HTTP implementation for the migrated operations.

---

## API contract

The feature API uses normal Promise behavior.

### Success

```text
return data
```

### Failure

```text
throw / reject
```

The feature API does not return error-shaped values from `catch`.

That makes future hooks predictable:

```js
try {
  const data = await getShiftSummary(posId);
} catch (error) {
  // real failure
}
```

---

## Legacy compatibility

Old consumers expect:

```text
{
  errCode,
  message
}
```

The compatibility bridge temporarily preserves that contract.

It will disappear when legacy consumers have migrated to feature-owned hooks/API.

---

## Dependency rule

Allowed during migration:

```text
legacy service
      ↓
sales feature API
```

Not allowed:

```text
sales feature
      ↓
legacy shift service
```

Future Sales code imports its own feature API.

---

## Files added

```text
src/features/sales/api/index.js
src/features/sales/api/shiftSummary.api.js
```

## Files modified

```text
src/services/shift.js
src/features/sales/README.md
README.md
docs/refactor/sales-migration-plan.md
```

## Files removed

```text
src/features/sales/api/.gitkeep
```

---

## Verification

Verify:

1. `/order-summary` still loads;
2. switching POS/kitchen still reloads summary;
3. editing initial quantities still succeeds;
4. refreshed values are correct;
5. other legacy consumers of `getShiftSummary` still work;
6. build succeeds.

Visible behavior should remain equivalent to before Step 2.

---

## Architecture lesson

Incremental migration should produce:

```text
one business owner
+
one implementation
+
temporary compatibility adapter
```

not two permanent implementations.

---

## Next step

Step 3 will simplify:

```text
selectedKitchen
posID
posName
posIds
kitchens
```

so a selected POS/kitchen has one source of truth.

# Step 5F.8 — Shared UI primitive audit

## Goal

Audit remaining direct Ant Design primitive usage after the shared UI foundation migration and remove obvious duplicate generic usage without forcing specialized controls into shared abstractions.

## Generic primitives established

```text
AppButton
AppInput / AppInput.TextArea / AppInput.Password
AppInputNumber
AppSelect
SearchInput
AppModal
EmptyState
```

## Final cleanup

Two generic Select usages missed by the earlier AppSelect migration were moved to `AppSelect`:

- `AssignMenuModal` kitchen selector;
- `ExportOrdersModal` unit selector.

Their duplicate feature-level Select skinning was removed so the shared primitive owns height, border, radius, hover and focus behavior.

## Intentional direct Ant Design controls

The following direct usages remain intentionally feature-owned:

- Login phone country selector and phone/password compound control;
- Order Edit money input with custom currency parsing/formatting;
- Topping Editor inline text/price editor;
- Sales initial-quantity stepper;
- ExactTimePicker input shell;
- Profile drawer form controls;
- icon-only, table-row, pagination, stepper, drawer and other context-specific buttons.

These are not migrated merely to eliminate imports. They have distinct interaction or geometry and do not yet prove one reusable application-level pattern.

## Shared-is-earned rule

A control is promoted to `shared` only when visual language or interaction behavior is genuinely repeated. Direct Ant Design usage is allowed for specialized controls.

## Verification

Expected after this audit:

- direct feature `Modal`: none;
- direct feature `Empty`: none;
- direct feature `Select`: login country selector only;
- direct feature `InputNumber`: topping inline editor + sales quantity stepper only;
- direct feature `Input`: specialized money/login/inline-editor cases only;
- direct `Button`: allowed for context-specific controls pending a proven reusable pattern.

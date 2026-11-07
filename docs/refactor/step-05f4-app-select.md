# Step 5F.4 — AppSelect

## Goal

Create one shared select primitive for reusable application selection controls.

## Component

```text
src/shared/components/AppSelect/
├── index.js
└── AppSelect.scss
```

## Sizes

```text
sm  → compact 36px controls
md  → standard 42px form controls
lg  → large 44px management/form controls
```

## Shared behavior

AppSelect now owns the common Select visual language:

- border and radius;
- typography;
- placeholder color;
- hover and focus states;
- disabled state;
- error state;
- multiple-select tags;
- dropdown active and selected states;
- optional width override;
- popup class composition.

## Migration

The previous `ManagementSelect` abstraction was removed. Its consumers now use
`AppSelect size="lg"` directly.

Reusable raw Ant Design Select controls were migrated in:

- AddressFormModal;
- AddressPosAssignmentModal;
- AddressOrderInfoModal;
- NotificationCreateModal;
- UserKitchenAssignmentModal;
- ShiftInventoryModal.

## Intentional exception

`LoginModal` keeps its raw Ant Design Select because the country-code selector is
part of a compound authentication field with custom flag rendering, divider,
50px geometry and auth-specific interaction styling. That behavior is not the
same shared Select pattern.

## Rule

Use `AppSelect` for normal application and form selection controls.

Keep a raw Ant Design Select only when the control has proven domain-specific or
compound behavior that would make the shared primitive less coherent.

## Verification

- production build passes;
- no `ManagementSelect` references remain;
- raw feature Select usage remains only in LoginModal;
- single and multiple selects render correctly;
- compact ShiftInventory select remains responsive;
- management header selects retain their previous widths;
- hover, focus, disabled and dropdown states work;
- `git diff --check` passes.

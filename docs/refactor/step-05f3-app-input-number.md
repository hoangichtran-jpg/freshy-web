# Step 5F.3 — AppInputNumber

## Goal

Create one shared numeric input primitive for standard numeric form fields while keeping specialized numeric controls feature-owned.

## Component

```text
src/shared/components/AppInputNumber/
├── index.js
└── AppInputNumber.scss
```

## Sizes

```text
sm  → 36px
md  → 42px
lg  → 44px
```

## Shared behavior

AppInputNumber standardizes:

- border and radius;
- typography;
- hover and focus states;
- disabled state;
- error state;
- placeholder styling;
- addon styling;
- numeric input height.

All native Ant Design `InputNumber` props continue to pass through, including formatter, parser, precision, step, min/max and addonAfter.

## Migration

Standard form fields were migrated in:

- ShiftInventoryModal;
- ToppingGroupFormModal;
- ItemFormModal;
- PosAddressFeeModal;
- AddressPosAssignmentModal;
- BannerCreateModal.

Feature-specific layout CSS remains responsible for local width and compact sizing where required.

## Intentionally not migrated

The following remain raw Ant Design InputNumber because their interaction is domain-specific:

- Sales quantity stepper;
- inline ToppingEditor price editor.

These should only move to shared when a second feature proves the same interaction pattern.

## Verification

- production build passes;
- AppInputNumber imports resolve;
- formatter/parser behavior is unchanged;
- money addon fields retain their layout;
- disabled and error states remain visible;
- specialized stepper/editor controls remain feature-owned.

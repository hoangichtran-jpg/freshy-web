# Step 5F.6 — AppModal

## Goal

Centralize the application dependency on Ant Design `Modal` without forcing
feature-specific modal content into one oversized shared component.

## Component

```text
src/shared/components/AppModal/
├── index.js
└── AppModal.scss
```

## Shared behavior

`AppModal` now owns the common modal boundary:

- Ant Design `Modal` is imported in one shared primitive;
- application modals are centered by default;
- modal state is destroyed on close by default;
- modal class names are merged through the shared primitive;
- modal width remains feature-controlled;
- the dialog is constrained to the viewport on narrow screens.

Intentional exceptions remain explicit. For example, the POS form keeps its
previous non-centered placement and modal flows that retain state keep
`destroyOnClose={false}`.

## What remains feature-specific

Feature and composite modal styles continue to own:

- domain-specific width;
- custom header/body/footer layouts;
- special scrolling behavior;
- special close-button placement;
- workflow-specific actions;
- special surfaces such as login, order detail and large inventory dialogs.

This follows the project rule that shared abstractions only own behavior that
is genuinely common.

## Migration

Direct Ant Design `Modal` usage was replaced by `AppModal` in feature modals,
`ConfirmModal`, and `ManagementFormModal`.

After this step, direct `Modal` usage should exist only inside
`src/shared/components/AppModal`.

## Verification

- production build passes;
- direct AntD `Modal` imports exist only in `AppModal`;
- existing modal widths are unchanged;
- POS form keeps its non-centered behavior;
- state-preserving modals still opt out of destroy-on-close;
- modal close, keyboard and mask behavior remain unchanged;
- desktop and mobile modal layouts do not overflow the viewport.

# Step 5F.7 — EmptyState

## Goal

Consolidate repeated Ant Design `Empty` usage into one shared presentation component without absorbing domain-specific empty-state logic.

## Shared component

```text
src/shared/components/EmptyState/
├── index.js
└── EmptyState.scss
```

`EmptyState` owns the common Ant Design empty presentation:

- default simple empty illustration;
- shared description typography;
- shared muted text color;
- optional custom image;
- optional custom class name;
- optional children/action content.

## Migration scope

Explicit feature-level Ant Design `Empty` usages were migrated to `EmptyState` across:

- address management;
- kitchen menu;
- marketing;
- notification management;
- order summary;
- orders;
- product management;
- sales;
- service quality;
- user management;
- user registration.

Feature-specific empty-state layouts remain feature-owned. Examples include richer table states that contain custom icons, titles, retry actions, or domain-specific explanatory copy.

## Rule

Use `EmptyState` when the UI is a generic “no data / no result” state.

Keep the state inside the feature when it carries domain-specific layout, behavior, or actions.

## Verification

- no direct Ant Design `Empty` imports remain in feature code;
- existing feature class names continue to work because `className` is forwarded to the underlying Ant Design `Empty`;
- table/domain-specific empty behavior remains unchanged;
- `git diff --check` passes.

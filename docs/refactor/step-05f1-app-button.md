# Step 5F.1 — AppButton

## Goal

Promote the repeated primary action button pattern into a shared UI primitive.

## Result

```text
src/shared/components/AppButton/
├── index.js
└── AppButton.scss
```

Supported variants:

```text
primary
secondary
danger
ghost
```

Supported sizes:

```text
sm
md
lg
```

The previous `PrimaryActionButton` abstraction was removed and its usages were migrated to `AppButton`.

Specialized controls such as pagination, close buttons, table icon actions and quantity steppers remain feature-owned until they prove a reusable pattern.

## Rule

Use `AppButton` for application actions that share the same interaction and visual language. Do not wrap every Ant Design button automatically.

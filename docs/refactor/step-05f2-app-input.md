# Step 5F.2 — AppInput and TextArea

## Goal

Create one shared primitive for standard text entry while keeping search fields and specialized controls separate.

## Result

```text
src/shared/components/AppInput/
├── index.js
└── AppInput.scss
```

API:

```jsx
<AppInput />
<AppInput.Password />
<AppInput.TextArea />
```

Supported sizes:

```text
sm
md
lg
```

The primitive owns the common input foundation:

- typography;
- border and radius baseline;
- hover and focus behavior;
- error state;
- disabled state;
- placeholder color;
- prefix / suffix / clear / password icon behavior.

## Migration scope

Standard form fields were migrated first.

The following remain raw Ant Design inputs intentionally:

- search fields — reserved for `SearchInput`;
- login phone/password shell — specialized authentication UX;
- money input — specialized numeric formatting;
- table filters — table-specific interaction;
- inline topping editor — compact inline editing;
- ExactTimePicker trigger — picker-specific control;
- profile drawer fields — app-shell profile UX will be migrated with its own form pass.

Feature SCSS may temporarily keep local layout or legacy visual overrides. Duplicate styling will be reduced during the shared primitive migration pass after all primitives exist.

## Rule

Shared primitives own reusable interaction and visual defaults. Feature styles own layout and domain-specific exceptions.

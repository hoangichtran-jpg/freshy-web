# Step 5F.5 — SearchInput

## Goal

Consolidate repeated search-field UI into one shared primitive while keeping layout and business behavior owned by each feature.

## Component

```text
src/shared/components/SearchInput/
├── index.js
└── SearchInput.scss
```

`SearchInput` builds on `AppInput` and owns the repeated search behavior:

- search icon;
- clear action;
- search-field hover and focus states;
- shared typography;
- shared icon treatment;
- shared 36 / 40 / 44 px search sizes.

## Sizes

```text
sm  36px  — compact catalog / form search
md  40px  — toolbars, popovers and table filters
lg  44px  — page-level management search
```

The size scale is search-specific. It preserves the existing hierarchy without changing the form-control sizing already established by `AppInput`.

## Migration

Search fields were migrated across:

- Orders;
- Product Management;
- Kitchen Menu;
- Address Management;
- User Management;
- User Registration;
- Marketing;
- Notification Management;
- Service Quality.

Feature SCSS now keeps only layout concerns such as width, flex behavior, responsive stacking, spacing, or a genuinely contextual surface treatment.

The visual skin of the search field no longer needs to be reimplemented in each feature.

## Intentional exceptions

`SearchOutlined` remains in the Orders table empty state because it is an illustration/glyph, not a search input implementation.

The login form remains feature-owned because its phone/country control is a compound authentication control rather than a generic search field.

## Rule

Use `SearchInput` for text search controls.

Feature styles may control:

- width / max-width;
- flex sizing;
- responsive behavior;
- context-specific spacing.

Feature styles should not redefine the shared search field's border, radius, typography, hover, focus, clear icon, or search icon unless the context genuinely requires a distinct interaction pattern.

## Verification

- all feature search controls use `SearchInput`;
- no duplicate search-field skin remains in feature SCSS;
- remaining `SearchOutlined` usage is non-input UI;
- relative imports resolve;
- SCSS braces remain balanced;
- README progress is updated;
- production build passes locally.

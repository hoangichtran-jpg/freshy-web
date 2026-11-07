# Shift inventory — shared UI and menu membership

`components/InventoryItemCards` renders both the shift-opening and shift-editing inventory modal. It must not fetch kitchen menus.

`utils/menuMembership.js` treats two shift items as belonging to the same menu if their persisted `menuIds` sets intersect; the legacy single `menuId` is accepted as fallback. Missing membership means **no target may be selected**, not unrestricted access.

Business rule: the "Trừ vào món" selector only includes items already in the current shift that share at least one selected menu with the source item. Both the frontend validation and **backend PUT validation** must enforce this rule.

See `docs/refactor/sales/step-inventory-menu-membership.md` for the new edit-context API requirement and older-shift behavior.

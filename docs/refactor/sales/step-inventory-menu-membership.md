# Inventory editor — preserve shift menu membership

## Bug

The Sales page used to call `getKitchenMenus(posId, page, 50)` repeatedly (up to 30 pages) after reading `/shifts/{shiftId}/inventory/edit` to recover each item's `menuId` from its `menuItemId`. This was slow, used the kitchen's **current** menu configuration instead of the shift-opening state, and could assign an incorrect menu to an item present in more than one menu.

## Rule

The stock-deduction target (`targetItemId`) must be an item **within the current shift** that shares **at least one selected menu** with its source item. A source item can belong to multiple selected menus.

## Frontend implementation

1. Opening a shift: the existing `selectedMenus` flatten/deduplication now preserves all menu memberships as `menuIds` on each deduplicated item; the old `menuId` remains for older UI code.
2. `buildShiftMenuSnapshot` now includes `menuIds` per item inside the existing `menuSnapshot.items` payload. It does **not** bump `schemaVersion`; backend compatibility with this additive field must be confirmed before rollout.
3. Shared `InventoryItemCards` uses `shareShiftMenu` for dropdown candidate filtering. The opening and editing modals therefore apply the same rule.
4. Sales editor now uses *only* `GET /shifts/current` and `GET /shifts/{shiftId}/inventory/edit`. It no longer pages through `menu-pos/api/pos-menu`.
5. Frontend edit validation forbids **new** cross-menu target selections, independent of the dropdown. Pre-existing target IDs are left as-is to avoid blocking other changes on old shifts; backend owns the final rule.
6. Opening a shift validates its target membership before POST.

## Required backend contract (NOT implemented in this frontend repository)

**Persist** the `menuIds` in the shift-opening snapshot and **return** them in each item of `GET /shifts/{shiftId}/inventory/edit`. This list must reflect the menus selected when the shift was opened, not whatever menus the POS currently has. Do not reconstruct it from current menu data.

Example response fragment:

```json
{
  "shiftId": 482,
  "posId": 30,
  "status": "OPENED",
  "items": [
    { "itemId": 101, "itemName": "Trà", "menuItemId": 901, "menuIds": [11, 12], "toppingGroups": [] },
    { "itemId": 102, "itemName": "Cà phê", "menuItemId": 902, "menuIds": [12], "toppingGroups": [] }
  ]
}
```

Keep existing `initialQuantity`, `quantitative`, `remainingQuantity`, and topping fields in the actual API payload; the snippet shows only the membership-relevant data.

**Enforce at the server** on `PUT /shifts/{shiftId}/inventory`: when `newTargetItemId` is requested, require both source and target to exist in the shift, and share at least one menu ID in the persisted snapshot. Reject cross-menu changes as a validation error. UI filtering alone cannot secure this rule.

**For older shifts** whose snapshot has no menu membership, consider a one-time migration using reliable historical membership data; do not guess from today's menu, and do not silently grant cross-menu access. The frontend opens the modal with the number/quantity inputs available but disables the dropdown for affected source items, with a warning.

## Verification checklist

- [ ] Open shift with two distinct menus; each source item sees only its own menu's items.
- [ ] Open shift where a single item appears in two menus; that item can choose targets sharing either menu.
- [ ] Edit an existing shift: Network shows `/shifts/current` then `/shifts/{id}/inventory/edit`, with **no kitchen menu pagination**.
- [ ] Change menu configuration after opening shift; editor choices remain based on that shift's snapshot.
- [ ] Old shift without `menuIds`/`menuId`: quantity edits work, target dropdown is disabled, warning is visible.
- [ ] Backend rejects forged cross-menu `newTargetItemId`.
- [ ] Retry/save retains existing Idempotency-Key behavior.
- [ ] Test both Open Shift and Edit Inventory modals on desktop and mobile.

## Verification status

Source inspection completed. Node syntax checks and isolated behavior checks can be run without React dependencies. `npm run build` and integrated browser/API tests require complete dependencies and an updated backend; do not mark as production-ready until they pass.

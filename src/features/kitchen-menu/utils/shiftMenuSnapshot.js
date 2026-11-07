/**
 * Build a complete menu snapshot at shift opening.
 *
 * Includes zero-quantity toppings.
 * Backend must validate and persist this snapshot.
 */

const requireId = (value, label) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    throw new Error(`${label} is required to create a shift snapshot`);
  }

  return value;
};

const quantity = (value, label, { positive = false, integer = false } = {}) => {
  if (value === null || value === undefined || String(value).trim() === "") {
    throw new Error(`${label} is required`);
  }

  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number < 0 ||
    (positive && number === 0) ||
    (integer && !Number.isInteger(number))
  ) {
    throw new Error(`${label} is invalid`);
  }

  return number;
};

const getToppingKey = (itemId, groupIndex, toppingId) =>
  `${itemId}-${groupIndex}-${toppingId}`;

export const buildShiftMenuSnapshot = ({
  items,
  initialQty,
  initialGram,
  toppingGram,
  ingredientMap,
}) => {
  if (!Array.isArray(items) || !items.length) {
    throw new Error("Cannot create snapshot without shift items");
  }

  const allowedItemIds = new Set(
    items.map((item) => String(requireId(item.itemId, "itemId"))),
  );

  if (allowedItemIds.size !== items.length) {
    throw new Error("Duplicate itemId in shift snapshot");
  }

  const rows = items.map((item) => {
    const itemId = requireId(item.itemId, "itemId");

    const seenToppings = new Set();

    const groups = (item.toppingDTO || [])
      .map((group, groupIndex) => {
        if (group?.isActive === false) {
          return null;
        }

        const toppingRows = (group.toppings || [])
          .filter((topping) => topping.isActive)
          .map((topping) => {
            const toppingId = requireId(topping.toppingId, "toppingId");

            const key = getToppingKey(itemId, groupIndex, toppingId);

            const identity = `${String(group.id)}:${String(toppingId)}`;

            if (seenToppings.has(identity)) {
              throw new Error(
                `Duplicate topping identity on item ${itemId}: ${identity}`,
              );
            }

            seenToppings.add(identity);

            const value = quantity(toppingGram[key] ?? 0, `topping ${key}`);

            const target = ingredientMap[key] ?? itemId;

            requireId(target, `targetItemId of topping ${key}`);

            if (!allowedItemIds.has(String(target))) {
              throw new Error(`Topping ${key} targets item outside the shift`);
            }

            return {
              toppingId,
              toppingName: String(topping.toppingName ?? ""),

              ordinalNumber: topping.ordinalNumber ?? null,

              // Keep 0; this is essential.
              quantitative: value,

              // Stock-deduction target.
              targetItemId: target,
            };
          });

        if (!toppingRows.length) {
          return null;
        }

        return {
          toppingGroupId: requireId(group.id, "toppingGroupId"),

          groupName: String(group.name ?? ""),

          ordinalNumber: group.ordinalNumber ?? null,

          toppings: toppingRows,
        };
      })
      .filter(Boolean);

    const rawMenuIds = Array.isArray(item.menuIds) && item.menuIds.length
      ? item.menuIds
      : [item.menuId];
    const menuIds = [...new Map(rawMenuIds.map((id) => {
      requireId(id, `menuId of item ${itemId}`);
      return [String(id), id];
    })).values()];

    return {
      itemId,

      // Membership of the menus selected when this shift was opened.
      // Backend must persist and expose this on /inventory/edit.
      menuIds,
      menuItemId: item.menuItemId ?? null,

      itemName: String(item.name ?? ""),

      isSpecial: Boolean(item.isSpecial),

      ordinalNumber: item.ordinalNumber ?? null,

      initialQuantity: quantity(
        initialQty[itemId],
        `initialQuantity ${itemId}`,
        { positive: true, integer: true },
      ),

      initialQuantitative: quantity(
        initialGram[itemId],
        `initialQuantitative ${itemId}`,
      ),

      toppingGroups: groups,
    };
  });

  return {
    schemaVersion: 1,
    items: rows,
  };
};


/**
 * Pure data adapters for the active-shift quantity editor.
 * Only persisted shift toppings (with shiftToppingId)
 * can be updated.
 */

const hasNumber = (value) =>
  value !== null &&
  value !== undefined &&
  (typeof value !== "string" || value.trim() !== "") &&
  Number.isFinite(Number(value));

export const isValidQuantity = (value, integerOnly = false) =>
  hasNumber(value) &&
  Number(value) >= 0 &&
  (!integerOnly || Number.isInteger(Number(value)));

const isChanged = (value, original) =>
  Number(value) !== Number(original);

export const createEditableItems = (items = []) =>
  items.map((item, index) => {
    const quantitative =
      item.quantitative ?? item.initialQuantitative;

    const hasQuantitative = hasNumber(quantitative);

    return {
      itemId: item.itemId,
      menuItemId: item.menuItemId,
      itemName: item.itemName,

      editableKey:
        `${item.itemId ?? "item"}:${item.menuItemId ?? "menu"}:${index}`,

      quantity: hasNumber(item.quantityInitial)
        ? Number(item.quantityInitial)
        : null,

      originalQuantity: hasNumber(item.quantityInitial)
        ? Number(item.quantityInitial)
        : null,

      quantitative: hasQuantitative
        ? Number(quantitative)
        : null,

      originalQuantitative: hasQuantitative
        ? Number(quantitative)
        : null,

      hasQuantitative,

      toppings: (
        Array.isArray(item.toppings) ? item.toppings : []
      ).map((topping, toppingIndex) => {
        const hasToppingQuantitative =
          hasNumber(topping.quantitative);

        return {
          shiftToppingId: topping.shiftToppingId,

          toppingName:
            topping.toppingName ??
            topping.name ??
            `Topping ${toppingIndex + 1}`,

          toppingGroupName:
            topping.toppingGroupName ?? null,

          editableKey:
            `${topping.shiftToppingId ?? "missing"}:${toppingIndex}`,

          quantitative: hasToppingQuantitative
            ? Number(topping.quantitative)
            : null,

          originalQuantitative: hasToppingQuantitative
            ? Number(topping.quantitative)
            : null,

          editable:
            topping.shiftToppingId != null &&
            hasToppingQuantitative,
        };
      }),
    };
  });

/**
 * Flatten for table rendering only.
 * Keep nested edit state for backend diffing.
 */
export const flattenEditableToppings = (editableItems = []) =>
  editableItems.flatMap((item) =>
    item.toppings.map((topping) => ({
      ...topping,

      parentKey: item.editableKey,
      parentName: item.itemName,

      rowKey:
        `${item.editableKey}:${topping.editableKey}`,
    })),
  );

/**
 * Distinguish missing data from genuinely empty topping data.
 */
export const getShiftToppingAvailability = (
  rawItems = [],
  editableItems = [],
) => {
  const reported = rawItems.filter(
    (item) => Array.isArray(item.toppings),
  ).length;

  const rows = flattenEditableToppings(editableItems);

  return {
    source:
      reported === 0
        ? "missing"
        : reported < rawItems.length
          ? "partial"
          : "present",

    count: rows.length,

    editableCount: rows.filter(
      (row) => row.editable,
    ).length,

    missingIdOrQuantity: rows.filter(
      (row) => !row.editable,
    ).length,
  };
};

/**
 * Only changed fields are sent to the backend.
 */
export const buildShiftQuantityPayload = (items = []) =>
  items
    .map((item) => {
      const change = {
        itemId: item.itemId,
        menuItemId: item.menuItemId,
      };

      if (isChanged(item.quantity, item.originalQuantity)) {
        change.newInitialQuantity = Number(item.quantity);
      }

      if (
        item.hasQuantitative &&
        isChanged(
          item.quantitative,
          item.originalQuantitative,
        )
      ) {
        change.newQuantitative = Number(item.quantitative);
      }

      const toppings = item.toppings
        .filter(
          (topping) =>
            topping.editable &&
            isChanged(
              topping.quantitative,
              topping.originalQuantitative,
            ),
        )
        .map((topping) => ({
          shiftToppingId: topping.shiftToppingId,
          newQuantitative: Number(topping.quantitative),
        }));

      if (toppings.length) {
        change.toppings = toppings;
      }

      return change;
    })
    .filter(
      (change) =>
        Object.prototype.hasOwnProperty.call(
          change,
          "newInitialQuantity",
        ) ||
        Object.prototype.hasOwnProperty.call(
          change,
          "newQuantitative",
        ) ||
        (change.toppings && change.toppings.length > 0),
    );

export const getShiftQuantityChangeSummary = (items = []) => {
  const payload = buildShiftQuantityPayload(items);

  return {
    itemCount: payload.length,

    fieldCount: payload.reduce(
      (count, change) =>
        count +
        Number(
          Object.prototype.hasOwnProperty.call(
            change,
            "newInitialQuantity",
          ),
        ) +
        Number(
          Object.prototype.hasOwnProperty.call(
            change,
            "newQuantitative",
          ),
        ) +
        (change.toppings?.length ?? 0),
      0,
    ),
  };
};

export const validateShiftQuantityItems = (items = []) => {
  for (const item of items) {
    if (!isValidQuantity(item.quantity, true)) {
      return "Số lượng ban đầu phải là số nguyên không âm.";
    }

    if (
      item.hasQuantitative &&
      !isValidQuantity(item.quantitative)
    ) {
      return "Định lượng món phải là số không âm.";
    }

    for (const topping of item.toppings) {
      if (
        topping.editable &&
        !isValidQuantity(topping.quantitative)
      ) {
        return "Định lượng topping phải là số không âm.";
      }
    }
  }

  return null;
};

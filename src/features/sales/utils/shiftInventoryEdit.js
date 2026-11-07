
import { shareShiftMenu } from "../../shift-inventory/utils/menuMembership";

const valid = (v) => v !== null && v !== undefined &&
  v !== "" && Number.isFinite(Number(v));
const differs = (a, b) => Number(a) !== Number(b);

export function createInventoryDraft(items = []) {
  return items.map((i) => ({
    ...i,
    originalInitialQuantity: i.initialQuantity,
    originalQuantitative: i.quantitative,
    toppingGroups: (i.toppingGroups || []).map((g) => ({
      ...g,
      toppings: (g.toppings || []).map((t) => ({
        ...t,
        originalQuantitative: t.quantitative,
        originalTargetItemId: t.targetItemId,
      })),
    })),
  }));
}

export function buildInventoryChanges(items = []) {
  return items.map((i) => {
    const entry = { itemId: i.itemId };

    if (differs(i.initialQuantity, i.originalInitialQuantity)) {
      entry.expectedInitialQuantity =
        Number(i.originalInitialQuantity);
      entry.newInitialQuantity = Number(i.initialQuantity);
    }
    if (differs(i.quantitative, i.originalQuantitative)) {
      entry.expectedQuantitative =
        Number(i.originalQuantitative);
      entry.newQuantitative = Number(i.quantitative);
    }

    const tops = (i.toppingGroups || []).flatMap((g) =>
      (g.toppings || []).flatMap((t) => {
        const qty = differs(
          t.quantitative, t.originalQuantitative
        );
        const target = String(t.targetItemId) !==
          String(t.originalTargetItemId);

        if (!qty && !target) return [];

        const row = {
          toppingGroupId: g.toppingGroupId,
          toppingId: t.toppingId,
          expectedQuantitative: Number(t.originalQuantitative),
        };

        if (qty) {
          row.newQuantitative = Number(t.quantitative);
        }
        if (target) {
          row.expectedTargetItemId = t.originalTargetItemId;
          row.newTargetItemId = t.targetItemId;
        }
        return [row];
      })
    );

    if (tops.length) entry.toppings = tops;
    return entry;
  }).filter((i) =>
    i.newInitialQuantity !== undefined ||
    i.newQuantitative !== undefined ||
    i.toppings?.length
  );
}

export function validateInventoryDraft(items = []) {
  const itemIds = new Set(
    items.map((i) => String(i.itemId))
  );

  for (const i of items) {
    if (!valid(i.initialQuantity) ||
        !Number.isInteger(Number(i.initialQuantity)) ||
        Number(i.initialQuantity) < 1) {
      return `Số suất ${i.itemName} phải là số nguyên từ 1.`;
    }
    if (!valid(i.quantitative) ||
        Number(i.quantitative) <= 0) {
      return `Định lượng món ${i.itemName} phải lớn hơn 0.`;
    }

    for (const g of i.toppingGroups || []) {
      for (const t of g.toppings || []) {
        if (!valid(t.quantitative) ||
            Number(t.quantitative) < 0) {
          return `Định lượng topping ${t.toppingName} phải từ 0 trở lên.`;
        }
        if (!itemIds.has(String(t.targetItemId))) {
          return `Món chịu trừ tồn của ${t.toppingName} không thuộc ca.`;
        }
        // Validate new selections only: legacy shifts may already contain a
        // target without historical menu membership. Leave it untouched.
        if (String(t.targetItemId) !== String(t.originalTargetItemId)) {
          const selected = items.find(
            (candidate) => String(candidate.itemId) === String(t.targetItemId),
          );
          if (!shareShiftMenu(i, selected)) {
            return `Món trừ tồn của ${t.toppingName} phải thuộc cùng menu.`;
          }
        }
      }
    }
  }
  return null;
}

export function flattenInventoryToppings(items = []) {
  return items.flatMap((i) =>
    (i.toppingGroups || []).flatMap((g) =>
      (g.toppings || []).map((t) => ({
        ...t,
        itemId: i.itemId,
        parentName: i.itemName,
        groupId: g.toppingGroupId,
        groupName: g.groupName,
        rowKey: `${i.itemId}:${g.toppingGroupId}:${t.toppingId}`,
      }))
    )
  );
}

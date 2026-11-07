
/**
 * Offline regression checks for Shift Step 2.
 *
 * Run:
 * node --experimental-default-type=module scripts/verify-shift-step2.mjs
 */

import assert from "node:assert/strict";

import {
  createEditableItems,
  buildShiftQuantityPayload,
  getShiftQuantityChangeSummary,
  validateShiftQuantityItems,
} from "../src/features/sales/utils/shiftQuantity.js";

const items = createEditableItems([
  {
    itemId: 101,
    menuItemId: 22,
    itemName: "Trà đào",
    quantityInitial: 12,
    quantitative: 1,
    toppings: [
      {
        shiftToppingId: 501,
        toppingName: "Thạch",
        quantitative: 0.5,
      },
      {
        shiftToppingId: 502,
        toppingName: "Trân châu",
        quantitative: 1,
      },
      {
        toppingId: 800,
        toppingName: "Thiếu shift ID",
        quantitative: 1,
      },
    ],
  },
  {
    itemId: 102,
    menuItemId: 23,
    itemName: "Trà sữa",
    quantityInitial: 6,
  },
]);

// Initially there are no changes.
assert.deepEqual(buildShiftQuantityPayload(items), []);

assert.equal(items[1].hasQuantitative, false);
assert.equal(items[1].quantitative, null);
assert.equal(items[0].toppings[2].editable, false);

// Edit initial quantity, item quantitative and toppings.
items[0].quantity = 0;
items[0].quantitative = 0.5;

items[0].toppings[0].quantitative = 0;
items[0].toppings[1].quantitative = 1.5;

items[1].quantity = 7;

assert.equal(
  validateShiftQuantityItems(items),
  null,
);

// Expect only changed fields in payload.
assert.deepEqual(buildShiftQuantityPayload(items), [
  {
    itemId: 101,
    menuItemId: 22,
    newInitialQuantity: 0,
    newQuantitative: 0.5,
    toppings: [
      {
        shiftToppingId: 501,
        newQuantitative: 0,
      },
      {
        shiftToppingId: 502,
        newQuantitative: 1.5,
      },
    ],
  },
  {
    itemId: 102,
    menuItemId: 23,
    newInitialQuantity: 7,
  },
]);

assert.deepEqual(
  getShiftQuantityChangeSummary(items),
  {
    itemCount: 2,
    fieldCount: 5,
  },
);

// Reject decimal initial quantity.
items[1].quantity = 2.5;

assert.match(
  validateShiftQuantityItems(items),
  /số nguyên/,
);

// Reject empty quantity.
items[1].quantity = null;

assert.match(
  validateShiftQuantityItems(items),
  /số nguyên/,
);

// Reject negative quantity.
items[1].quantity = -1;

assert.match(
  validateShiftQuantityItems(items),
  /số nguyên/,
);

// Reject invalid topping quantitative.
items[1].quantity = 7;
items[0].toppings[0].quantitative = null;

assert.match(
  validateShiftQuantityItems(items),
  /topping/,
);

// Check fallback for older summary field naming.
const fallback = createEditableItems([
  {
    itemId: 201,
    menuItemId: 33,
    quantityInitial: 3,
    initialQuantitative: 0.5,
  },
]);

assert.equal(fallback[0].quantitative, 0.5);

assert.deepEqual(
  buildShiftQuantityPayload(fallback),
  [],
);

console.log(
  "Shift Step 2: offline regression assertions passed.",
);

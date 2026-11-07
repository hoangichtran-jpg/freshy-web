import assert from "node:assert/strict";

import {
  buildShiftQuantityPayload,
  createEditableItems,
  flattenEditableToppings,
  getShiftToppingAvailability,
  validateShiftQuantityItems,
} from "../src/features/sales/utils/shiftQuantity.js";

// Missing toppings != empty toppings
const incomplete = [
  {
    itemId: 10,
    menuItemId: 100,
    itemName: "Tea",
    quantityInitial: 5,
  },
];

assert.equal(
  getShiftToppingAvailability(incomplete, createEditableItems(incomplete))
    .source,
  "missing",
);

const trulyEmpty = [{ ...incomplete[0], toppings: [] }];

assert.deepEqual(
  getShiftToppingAvailability(trulyEmpty, createEditableItems(trulyEmpty)),
  {
    source: "present",
    count: 0,
    editableCount: 0,
    missingIdOrQuantity: 0,
  },
);

// Mock shift data
const summary = [
  {
    itemId: 10,
    menuItemId: 100,
    itemName: "Tea",
    quantityInitial: 5,
    quantitative: 1,
    toppings: [
      {
        shiftToppingId: 501,
        toppingName: "Pearl",
        quantitative: 0.5,
      },
      {
        shiftToppingId: 502,
        toppingName: "Jelly",
        quantitative: 1,
      },
      {
        toppingId: 999,
        toppingName: "Not persisted in shift",
        quantitative: 2,
      },
    ],
  },
  {
    itemId: 11,
    menuItemId: 101,
    itemName: "Milk tea",
    quantityInitial: 6,
    toppings: [
      {
        shiftToppingId: 503,
        toppingName: "Pearl",
        quantitative: 0.5,
      },
    ],
  },
];

const editable = createEditableItems(summary);
const rows = flattenEditableToppings(editable);

assert.equal(rows.length, 4);
assert.notEqual(rows[0].rowKey, rows[3].rowKey);
assert.equal(rows[2].editable, false);

assert.deepEqual(getShiftToppingAvailability(summary, editable), {
  source: "present",
  count: 4,
  editableCount: 3,
  missingIdOrQuantity: 1,
});

// Before editing, payload must be empty.
assert.deepEqual(buildShiftQuantityPayload(editable), []);

// Edit ONLY toppings.
editable[0].toppings[0].quantitative = 0;
editable[1].toppings[0].quantitative = 1.5;

assert.deepEqual(buildShiftQuantityPayload(editable), [
  {
    itemId: 10,
    menuItemId: 100,
    toppings: [{ shiftToppingId: 501, newQuantitative: 0 }],
  },
  {
    itemId: 11,
    menuItemId: 101,
    toppings: [{ shiftToppingId: 503, newQuantitative: 1.5 }],
  },
]);

assert.equal(validateShiftQuantityItems(editable), null);

// Blank topping quantity must be invalid.
editable[0].toppings[0].quantitative = null;

assert.match(validateShiftQuantityItems(editable), /topping/);

console.log("Shift topping editor: offline tests passed.");

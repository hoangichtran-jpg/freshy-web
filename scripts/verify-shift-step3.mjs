
/**
 * Run: node --experimental-default-type=module scripts/verify-shift-step3.mjs
 * No React dependencies or backend connection required.
 */
import assert from "node:assert/strict";
import {
  displayShiftNumber,
  displayShiftValue,
  getAuditBeforeAfter,
  normalizeShiftHistoryDetail,
  normalizeShiftHistoryPage,
} from "../src/features/sales/utils/shiftHistory.js";

const list = normalizeShiftHistoryPage({
  content: [
    { shiftId: 17, name: "Ca sáng", totalPrice: 0, status: "CLOSED" },
  ],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 20,
});

assert.equal(list.total, 1);
assert.equal(list.rows[0].shiftId, 17);
assert.throws(() => normalizeShiftHistoryPage([]), /định dạng/);
assert.throws(
  () => normalizeShiftHistoryPage({ content: [{}], totalElements: 1 }),
  /shiftId/,
);
assert.throws(
  () => normalizeShiftHistoryPage({ content: [], totalElements: null }),
  /totalElements/,
);

const detail = normalizeShiftHistoryDetail({
  shiftId: 17,
  items: [],
  adjustments: [],
});

assert.equal(detail.shiftId, 17);
assert.throws(
  () => normalizeShiftHistoryDetail({ shiftId: 17, items: [] }),
  /adjustments/,
);
assert.deepEqual(
  getAuditBeforeAfter({ oldValue: 0, newValue: 0.5 }),
  { before: 0, after: 0.5 },
);
assert.deepEqual(
  getAuditBeforeAfter({ oldQuantity: 4, newQuantity: 0 }),
  { before: 4, after: 0 },
);
assert.equal(displayShiftNumber(0), "0");
assert.equal(displayShiftValue(null), "—");

console.log("Shift Step 3: offline DTO tests passed.");

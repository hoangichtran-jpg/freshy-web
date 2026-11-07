import { canShowPendingOrders, closeFailureMessage } from "./shiftCloseFlow";

const conflict = { response: { status: 409, data: { message: "SHIFT_HAS_UNRESOLVED_REQUESTS: 1 request(s)" } } };
const preflight = { shiftId: 543, ready: false, blockerCount: 1, blockers: [
  { requestId: "RQ-1", ledgerState: "APPLIED", redisStatus: "PENDING", databaseStatus: "PENDING", reason: "APPLIED_NOT_FINISHED_OR_NOT_SYNCED" },
] };

test("only genuine PENDING close conflict routes to order modal", () => {
  expect(canShowPendingOrders(conflict, preflight, 543)).toBe(true);
  expect(canShowPendingOrders(conflict, { ...preflight, shiftId: 542 }, 543)).toBe(false);
  expect(canShowPendingOrders(conflict, { ...preflight, ready: true }, 543)).toBe(false);
  expect(canShowPendingOrders(conflict, { ...preflight, blockers: [] }, 543)).toBe(false);
});

test("generic conflicts and nonpending blockers use existing error modal", () => {
  expect(canShowPendingOrders({ response: { status: 409, data: { message: "SHIFT_NOT_OPEN" } } }, preflight, 543)).toBe(false);
  expect(canShowPendingOrders(conflict, { ...preflight, blockers: [{ databaseStatus: "CANCELED", redisStatus: "CANCELED" }] }, 543)).toBe(false);
  expect(canShowPendingOrders({ response: { status: 500 } }, preflight, 543)).toBe(false);
});

test("errors are business-friendly and do not expose raw service messages", () => {
  expect(closeFailureMessage({ response: { status: 500, data: { message: "internal exception" } } })).not.toContain("exception");
  expect(closeFailureMessage({ response: { status: 403 } })).toMatch(/quyền/);
});

test("a stale Redis PENDING / DB MAKING mismatch never opens the cancelable list", () => {
  expect(canShowPendingOrders(conflict, { ...preflight, blockers: [
    { ...preflight.blockers[0], databaseStatus: "MAKING" },
  ] }, 543)).toBe(false);
});

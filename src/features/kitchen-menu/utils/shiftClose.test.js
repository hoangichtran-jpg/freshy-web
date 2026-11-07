import { canConfirmShiftClose, blockerLabel, shiftApiError } from "./shiftClose";

const current = { shiftId: 542, shiftStatus: "OPENED" };
const ready = { shiftId: 542, ready: true, blockerCount: 0, special: false };

test("enables close only for the inspected, opened shift", () => {
  expect(canConfirmShiftClose(ready, current, false)).toBe(true);
  expect(canConfirmShiftClose({ ...ready, shiftId: 539 }, current, false)).toBe(false);
  expect(canConfirmShiftClose(ready, { ...current, shiftStatus: "CLOSED" }, false)).toBe(false);
  expect(canConfirmShiftClose(ready, current, true)).toBe(false);
});

test("blocks close when any unresolved request remains", () => {
  expect(canConfirmShiftClose({ ...ready, ready: false, blockerCount: 1 }, current, false)).toBe(false);
  expect(canConfirmShiftClose({ ...ready, blockerCount: 1 }, current, false)).toBe(false);
  expect(canConfirmShiftClose(null, current, false)).toBe(false);
});

test("presents a readable description for known blockers", () => {
  expect(blockerLabel({ reason: "APPLIED_NOT_FINISHED_OR_NOT_SYNCED" })).toMatch(/chưa hoàn tất/);
});

test("uses backend error message rather than stringifying response objects", () => {
  expect(shiftApiError({ response: { data: { message: "SHIFT_HAS_UNRESOLVED_REQUESTS" } } })).toBe("SHIFT_HAS_UNRESOLVED_REQUESTS");
});

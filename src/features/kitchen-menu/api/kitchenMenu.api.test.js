import { request } from "../../../shared/api/httpClient";
import { getShiftOrdering, updateShiftOrdering, getShiftClosePreflight, getShiftCloseBlockers, getShiftCloseBlockerDetail } from "./kitchenMenu.api";

jest.mock("../../../shared/api/httpClient", () => ({
  request: { get: jest.fn(), put: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

test("reads admission snapshot for a specific POS", async () => {
  request.get.mockResolvedValue({ data: { shiftId: 542, admissionStatus: "PAUSED" } });
  expect(await getShiftOrdering(1)).toMatchObject({ admissionStatus: "PAUSED" });
  expect(request.get).toHaveBeenCalledWith("/shifts/1/ordering");
});

test("mutates using expected shift id to reject stale tabs", async () => {
  request.put.mockResolvedValue({ data: { shiftId: 542, admissionStatus: "ACCEPTING" } });
  await updateShiftOrdering(1, 542, "ACCEPTING");
  expect(request.put).toHaveBeenCalledWith("/shifts/1/ordering", { shiftId: 542, status: "ACCEPTING" });
});

test("rejects invalid status without making a request", async () => {
  await expect(updateShiftOrdering(1, 542, "CLOSED")).rejects.toThrow();
  expect(request.put).not.toHaveBeenCalled();
});

test("read-only preflight uses special=false by default", async () => {
  request.get.mockResolvedValue({ data: { shiftId: 542, ready: false, blockerCount: 1 } });
  expect(await getShiftClosePreflight(1)).toMatchObject({ blockerCount: 1 });
  expect(request.get).toHaveBeenCalledWith("/shifts/1/close-preflight", { params: { special: false } });
});


test("loads list lazily through dedicated endpoint", async () => {
  request.get.mockResolvedValue({ data: { shiftId: 542, requests: [] } });
  await getShiftCloseBlockers(1, false);
  expect(request.get).toHaveBeenCalledWith("/shifts/1/close-blockers", { params: { special: false } });
});

test("detail is scoped to shift and URL-encodes the request code", async () => {
  request.get.mockResolvedValue({ data: { requestId: "RQ-1" } });
  await getShiftCloseBlockerDetail(1, 542, "RQ-1", false);
  expect(request.get).toHaveBeenCalledWith("/shifts/1/close-blockers/RQ-1", {
    params: { special: false, shiftId: 542 },
  });
});

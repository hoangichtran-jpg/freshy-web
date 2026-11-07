import { groupCloseBlockers } from "./closeBlockers";

test("groups requests by unit AND address without dropping requests", () => {
  const groups = groupCloseBlockers([
    { requestId: "RQ1", unit: "A", address: "X" },
    { requestId: "RQ2", unit: "A", address: "X" },
    { requestId: "RQ3", unit: "B", address: "X" },
  ]);
  expect(groups).toHaveLength(2);
  expect(groups[0].requests.map((r) => r.requestId)).toEqual(["RQ1", "RQ2"]);
  expect(groups[1].requests).toHaveLength(1);
});

test("missing address is shown explicitly, never merges with a real address", () => {
  const groups = groupCloseBlockers([{ requestId: "R1" }, { requestId: "R2", address: "X" }]);
  expect(groups).toHaveLength(2);
  expect(groups[0].address).toBe("Chưa có địa chỉ");
});

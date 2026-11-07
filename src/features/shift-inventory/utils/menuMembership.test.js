import { getItemMenuIds, shareShiftMenu } from "./menuMembership";

it("normalizes a legacy menuId without requiring a complete menu list", () => {
  expect(getItemMenuIds({ menuId: 14 })).toEqual(["14"]);
  expect(getItemMenuIds({})).toEqual([]);
});

it("preserves multiple memberships without duplicates", () => {
  expect(getItemMenuIds({ menuIds: [12, "12", 14], menuId: 99 })).toEqual([
    "12", "14",
  ]);
});

it("only allows targets within at least one shared shift menu", () => {
  const source = { menuIds: [11, 12] };
  expect(shareShiftMenu(source, { menuId: 12 })).toBe(true);
  expect(shareShiftMenu(source, { menuIds: [13, 14] })).toBe(false);
  expect(shareShiftMenu(source, {})).toBe(false);
  expect(shareShiftMenu({}, source)).toBe(false);
});

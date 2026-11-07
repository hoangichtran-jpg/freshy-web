/**
 * A shift item may belong to multiple selected menus.
 * Prefer the persisted membership list; menuId supports older DTOs.
 * Missing membership must never imply permission to choose all items.
 */
export const getItemMenuIds = (item = {}) => {
  const rawIds = Array.isArray(item.menuIds) && item.menuIds.length > 0
    ? item.menuIds
    : [item.menuId];

  return [...new Set(
    rawIds
      .filter((id) => id !== null && id !== undefined && String(id).trim() !== "")
      .map(String),
  )];
};

export const shareShiftMenu = (source, candidate) => {
  const menuIds = new Set(getItemMenuIds(source));
  return menuIds.size > 0 &&
    getItemMenuIds(candidate).some((id) => menuIds.has(id));
};

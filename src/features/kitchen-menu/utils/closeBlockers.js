/** Group only after a manager explicitly opens the unresolved-request list. */
export function groupCloseBlockers(rows = []) {
  const groups = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const unit = String(row.unit || "Chưa có đơn vị").trim();
    const address = String(row.address || "Chưa có địa chỉ").trim();
    const key = JSON.stringify([unit, address]);
    if (!groups.has(key)) groups.set(key, { key, unit, address, requests: [] });
    groups.get(key).requests.push(row);
  });
  return Array.from(groups.values());
}

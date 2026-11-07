
/**
 * DTO boundary for Shift History.
 * Do not turn an unknown response into a fake empty history.
 */
export const normalizeShiftHistoryPage = (response) => {
  if (!response || !Array.isArray(response.content)) {
    throw new Error("Response lịch sử ca không đúng định dạng phân trang.");
  }

  if (response.content.some((shift) => shift?.shiftId == null)) {
    throw new Error("Danh sách lịch sử ca thiếu shiftId.");
  }

  const total = Number(response.totalElements);

  if (
    response.totalElements == null ||
    response.totalElements === "" ||
    !Number.isInteger(total) ||
    total < 0
  ) {
    throw new Error("Response lịch sử ca thiếu totalElements hợp lệ.");
  }

  return { rows: response.content, total };
};

export const normalizeShiftHistoryDetail = (response) => {
  if (!response || response.shiftId == null) {
    throw new Error("Chi tiết ca thiếu shiftId.");
  }

  if (!Array.isArray(response.items) || !Array.isArray(response.adjustments)) {
    throw new Error("Chi tiết ca thiếu items hoặc adjustments.");
  }

  return response;
};

export const displayShiftValue = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : String(value);

export const displayShiftNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 }).format(number)
    : String(value);
};

/**
 * Field names for value changes need confirmation from a real detail JSON.
 * No synthetic before/after values are calculated.
 */
export const getAuditBeforeAfter = (adjustment) => ({
  before: adjustment.oldValue ?? adjustment.oldQuantity,
  after: adjustment.newValue ?? adjustment.newQuantity,
});

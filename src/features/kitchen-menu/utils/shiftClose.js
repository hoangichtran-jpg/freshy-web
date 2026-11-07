/** UI readiness is only a hint. POST /close repeats every backend check. */
export function canConfirmShiftClose(preflight, snapshot, special) {
  return Boolean(
    preflight && preflight.ready === true &&
    preflight.blockerCount === 0 &&
    snapshot && snapshot.shiftStatus === "OPENED" &&
    String(preflight.shiftId) === String(snapshot.shiftId) &&
    preflight.special === Boolean(special)
  );
}

export function shiftApiError(error, fallback = "Vui lòng thử lại.") {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || error?.message || fallback;
}

export const blockerLabel = (blocker) => {
  const reason = blocker?.reason;
  if (reason === "APPLIED_NOT_FINISHED_OR_NOT_SYNCED") {
    return "Đơn chưa hoàn tất hoặc chưa đồng bộ";
  }
  if (reason === "RESTORED_NOT_CANCELED_OR_NOT_SYNCED") {
    return "Trạng thái hủy chưa được đối soát";
  }
  return reason || "Cần kiểm tra và đối soát";
};

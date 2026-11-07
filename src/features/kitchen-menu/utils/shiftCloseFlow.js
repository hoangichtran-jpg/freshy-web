/**
 * Backend owns the close decision. UI only decides which explanation to show
 * after POST /close fails; never interpret a generic HTTP 409 as pending orders.
 */
export const isUnresolvedCloseConflict = (error) =>
  error?.response?.status === 409 &&
  String(error?.response?.data?.message || "").includes("SHIFT_HAS_UNRESOLVED_REQUESTS");

export const isPendingCloseBlocker = (blocker) =>
  blocker?.databaseStatus === "PENDING" &&
  blocker?.redisStatus === "PENDING" &&
  blocker?.ledgerState === "APPLIED" &&
  blocker?.reason === "APPLIED_NOT_FINISHED_OR_NOT_SYNCED";

/** Return true only for a verified, current-shift PENDING request conflict. */
export const canShowPendingOrders = (error, preflight, shiftId) => {
  const blockers = preflight?.blockers;
  return Boolean(
    isUnresolvedCloseConflict(error) &&
      shiftId != null &&
      String(preflight?.shiftId) === String(shiftId) &&
      preflight?.ready === false &&
      Number(preflight?.blockerCount) > 0 &&
      Array.isArray(blockers) &&
      blockers.length > 0 &&
      blockers.every(isPendingCloseBlocker)
  );
};

/** A stable user-facing message; hide raw internal errors and stack traces. */
export function closeFailureMessage(error) {
  const status = error?.response?.status;
  if (status === 403) return "Bạn không có quyền đóng ca này.";
  if (status === 404) return "Không tìm thấy ca đang mở. Vui lòng tải lại trang.";
  if (status === 409) return "Trạng thái ca hoặc dữ liệu đối soát chưa phù hợp. Vui lòng kiểm tra lại và thử sau.";
  if (status === 412) return "Ca vẫn còn đơn chưa hoàn tất hoặc điều kiện đóng ca chưa được đáp ứng.";
  if (status >= 500) return "Hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ quản lý.";
  if (!error?.response) return "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  return "Không thể đóng ca lúc này. Vui lòng thử lại sau.";
}

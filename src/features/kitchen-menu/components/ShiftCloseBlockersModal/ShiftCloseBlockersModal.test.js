import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ShiftCloseBlockersModal from "./index";
import { getShiftCloseBlockers, getShiftCloseBlockerDetail, getShiftClosePreflight, cancelPendingRequestForClose } from "../../api";

jest.mock("../../../../shared/components/AppModal", () => ({ open, children }) => open ? <div>{children}</div> : null);
jest.mock("../../../../shared/components/AppButton", () => ({ children, onClick, disabled, loading }) =>
  <button type="button" disabled={disabled || loading} onClick={onClick}>{children}</button>);
jest.mock("../../api", () => ({
  getShiftCloseBlockers: jest.fn(),
  getShiftCloseBlockerDetail: jest.fn(),
  getShiftClosePreflight: jest.fn(),
  cancelPendingRequestForClose: jest.fn(),
}));

const props = {
  open: true, context: { posId: 1, shiftId: 543, kitchenName: "249 NGUYEN KHANG", count: 1 },
  onClose: jest.fn(), onResolved: jest.fn(), onUnexpected: jest.fn(),
};
beforeEach(() => jest.clearAllMocks());

test("lazy loads grouped summaries and one detail, never on initial mount", async () => {
  getShiftCloseBlockers.mockResolvedValue({ shiftId: 543, blockerCount: 1,
    requests: [{ requestId: "RQ-1", unit: "HKCARE", address: "Cầu Giấy", status: "PENDING" }] });
  getShiftCloseBlockerDetail.mockResolvedValue({ requestId: "RQ-1", unit: "HKCARE", items: [] });
  render(<ShiftCloseBlockersModal {...props} />);
  expect(screen.getByRole("heading", { name: "Chưa thể đóng ca" })).toBeTruthy();
  expect(screen.getByText("Còn 1 đơn chưa hoàn tất")).toBeTruthy();
  expect(screen.getByText("Xem đơn cần xử lý")).toBeTruthy();
  expect(screen.getByText("Hoàn tất hoặc hủy hợp lệ đơn này trước khi đóng ca.")).toBeTruthy();
  expect(getShiftCloseBlockers).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /Xem đơn cần xử lý/ }));
  await waitFor(() => expect(screen.getByText("HKCARE")).toBeTruthy());
  expect(getShiftCloseBlockers).toHaveBeenCalledWith(1, false);
  expect(getShiftCloseBlockerDetail).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("HKCARE"));
  fireEvent.click(screen.getByText("RQ-1"));
  await waitFor(() => expect(getShiftCloseBlockerDetail).toHaveBeenCalledWith(1, 543, "RQ-1", false));
});

test("preflight retry never auto-submits close POST", async () => {
  getShiftClosePreflight.mockResolvedValue({ shiftId: 543, ready: true, blockerCount: 0 });
  render(<ShiftCloseBlockersModal {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Kiểm tra lại" }));
  await waitFor(() => expect(props.onResolved).toHaveBeenCalledTimes(1));
  expect(getShiftCloseBlockers).not.toHaveBeenCalled();
  expect(getShiftCloseBlockerDetail).not.toHaveBeenCalled();
});


test("shows a single known request ID without eager loading details", () => {
  render(<ShiftCloseBlockersModal {...props} context={{ ...props.context, requestId: "RQ-20261024-0001" }} />);
  expect(screen.getByText("RQ-20261024-0001")).toBeTruthy();
  expect(getShiftCloseBlockers).not.toHaveBeenCalled();
  expect(getShiftCloseBlockerDetail).not.toHaveBeenCalled();
});

test("uses plural copy and a subtle admission note for multiple blockers", () => {
  render(<ShiftCloseBlockersModal {...props} context={{ ...props.context,
    count: 3, requestId: null, acceptancePaused: true }} />);
  expect(screen.getByText("Còn 3 đơn chưa hoàn tất")).toBeTruthy();
  expect(screen.getByText("Vui lòng xử lý các đơn này trước khi đóng ca.")).toBeTruthy();
  expect(screen.getByText("Xem danh sách đơn")).toBeTruthy();
  expect(screen.getByText("Xem theo đơn vị và địa chỉ")).toBeTruthy();
  expect(screen.getByText(/Nhận đơn mới đang tạm ngừng/)).toBeTruthy();
  expect(getShiftCloseBlockers).not.toHaveBeenCalled();
  expect(getShiftCloseBlockerDetail).not.toHaveBeenCalled();
});

test("hides the admission note when PAUSED is not confirmed", () => {
  render(<ShiftCloseBlockersModal {...props} />);
  expect(screen.queryByText(/Nhận đơn mới đang tạm ngừng/)).toBeNull();
  expect(screen.getByRole("button", { name: "Để sau" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Kiểm tra lại" })).toBeTruthy();
});


test("V4 cancellation is hidden when server feature flag is disabled", async () => {
  getShiftCloseBlockers.mockResolvedValue({ shiftId: 543, blockerCount: 1,
    pendingCancellationEnabled: false,
    requests: [{ requestId: "RQ-1", unit: "HKCARE", address: "Cầu Giấy", status: "PENDING" }] });
  getShiftCloseBlockerDetail.mockResolvedValue({ requestId: "RQ-1", status: "PENDING",
    paymentStatus: "NOT_PAID", unit: "HKCARE", items: [] });
  render(<ShiftCloseBlockersModal {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /Xem đơn cần xử lý/ }));
  await waitFor(() => screen.getByText("HKCARE"));
  fireEvent.click(screen.getByText("HKCARE"));
  fireEvent.click(screen.getByText("RQ-1"));
  await waitFor(() => screen.getByText(/Tính năng hủy nhanh đang tắt/));
  expect(screen.queryByRole("button", { name: "Xác nhận hủy đơn" })).toBeNull();
  expect(cancelPendingRequestForClose).not.toHaveBeenCalled();
});

test("V4 requires an explicit per-request confirmation before calling cancellation API", async () => {
  getShiftCloseBlockers.mockResolvedValue({ shiftId: 543, blockerCount: 1,
    pendingCancellationEnabled: true,
    requests: [{ requestId: "RQ-1", unit: "HKCARE", address: "Cầu Giấy", status: "PENDING" }] });
  getShiftCloseBlockerDetail.mockResolvedValue({ requestId: "RQ-1", status: "PENDING",
    paymentStatus: "NOT_PAID", unit: "HKCARE", items: [] });
  cancelPendingRequestForClose.mockResolvedValue({ requestId: "RQ-1", shiftId: 543,
    canceled: true, readyToClose: true, remainingBlockers: 0 });
  render(<ShiftCloseBlockersModal {...props} />);
  fireEvent.click(screen.getByRole("button", { name: /Xem đơn cần xử lý/ }));
  await waitFor(() => screen.getByText("HKCARE"));
  fireEvent.click(screen.getByText("HKCARE"));
  fireEvent.click(screen.getByText("RQ-1"));
  await waitFor(() => screen.getByRole("button", { name: "Hủy đơn đang chờ" }));
  expect(cancelPendingRequestForClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Hủy đơn đang chờ" }));
  expect(cancelPendingRequestForClose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận hủy đơn" }));
  await waitFor(() => expect(cancelPendingRequestForClose).toHaveBeenCalledWith(1, 543, "RQ-1"));
  await waitFor(() => expect(props.onResolved).toHaveBeenCalledTimes(1));
});

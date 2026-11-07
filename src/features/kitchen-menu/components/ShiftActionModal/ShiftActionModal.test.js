import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import ShiftActionModal from "./index";

jest.mock("../../../../shared/components/AppModal", () => ({ open, children }) => open ? <div>{children}</div> : null);
jest.mock("../../../../shared/components/AppButton", () => ({ children, onClick, disabled, loading }) =>
  <button type="button" disabled={disabled || loading} onClick={onClick}>{children}</button>);

const props = {
  open: true, kitchenName: "249 NGUYEN KHANG", openingShift: false,
  closingShift: false, canManage: true,
  operating: { snapshot: { shiftStatus: "OPENED", shiftId: 543, posId: 1 } },
  onOpenShift: jest.fn(), onCloseShift: jest.fn(), onClose: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

test("shows a single, direct Close action without special shift or manual preflight", () => {
  render(<ShiftActionModal {...props} />);
  expect(screen.getByText("Đóng ca bán hàng")).toBeTruthy();
  expect(screen.queryByText("Ca đặc biệt")).toBeNull();
  expect(screen.queryByText("Kiểm tra đóng ca")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Đóng ca" }));
  expect(props.onCloseShift).toHaveBeenCalledTimes(1);
});

test("only shows Open when no shift is active; blocks Close during fetch", () => {
  const { rerender } = render(<ShiftActionModal {...props}
    operating={{ snapshot: { shiftStatus: "CLOSED", posId: 1 } }} />);
  expect(screen.getByRole("button", { name: "Mở ca" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Đóng ca" })).toBeNull();
  rerender(<ShiftActionModal {...props} operating={{ ...props.operating, statusLoading: true }} />);
  expect(screen.getByRole("button", { name: "Đóng ca" }).disabled).toBe(true);
});

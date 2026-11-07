import React from "react";
import PropTypes from "prop-types";
import { Alert, Spin } from "antd";
import { CheckCircleOutlined, LockOutlined, PoweroffOutlined } from "@ant-design/icons";
import AppModal from "../../../../shared/components/AppModal";
import AppButton from "../../../../shared/components/AppButton";
import "./ShiftActionModal.scss";

/** The backend checks the close on POST; no separate preflight action in the UI. */
export default function ShiftActionModal({ open, kitchenName, openingShift, closingShift,
  canManage, operating, onOpenShift, onCloseShift, onClose }) {
  const { snapshot, statusLoading, statusError } = operating;
  const shiftOpen = snapshot?.shiftStatus === "OPENED" && snapshot?.shiftId != null;
  const busy = openingShift || closingShift;
  const canAct = canManage && !busy && !statusLoading && !statusError && Boolean(snapshot);
  return (
    <AppModal open={open} width={500} footer={null} centered
      onCancel={busy ? undefined : onClose} closable={!busy}
      maskClosable={!busy} keyboard={!busy} wrapClassName="shift-action-modal">
      <div className="shift-action-modal__heading">
        <h2 className="shift-action-modal__title">{shiftOpen ? "Đóng ca bán hàng" : "Mở ca bán hàng"}</h2>
        <p className="shift-action-modal__kitchen">{kitchenName || "Trung tâm đang chọn"}
          {snapshot?.shiftId != null ? ` · Ca #${snapshot.shiftId}` : ""}</p>
      </div>
      <div className="shift-action-modal__content">
        {statusLoading && <div className="shift-action-modal__loading"><Spin size="small" /> Đang tải thông tin ca...</div>}
        {statusError && <Alert showIcon type="error" message="Chưa thể tải thông tin ca"
          description="Vui lòng đóng cửa sổ và thử lại. Không thể đóng ca khi chưa xác định được ca hiện tại." />}
        {!statusLoading && !statusError && shiftOpen && <>
          <div className="shift-action-modal__notice">
            <span className="shift-action-modal__notice-icon"><LockOutlined /></span>
            <div>
              <strong>Chốt ca hiện tại</strong>
              <p>Hệ thống sẽ kiểm tra các đơn chưa hoàn tất trước khi đóng ca. Nếu còn đơn cần xử lý, bạn sẽ được xem danh sách.</p>
            </div>
          </div>
          <p className="shift-action-modal__hint"><CheckCircleOutlined /> Không tự động hủy đơn hàng để đóng ca.</p>
        </>}
        {!statusLoading && !statusError && !shiftOpen && <div className="shift-action-modal__notice">
          <span className="shift-action-modal__notice-icon"><PoweroffOutlined /></span>
          <div><strong>Chưa có ca đang mở</strong><p>Mở ca để chuẩn bị thực đơn và tồn kho trước khi bán hàng.</p></div>
        </div>}
        <div className="shift-action-modal__footer">
          <AppButton variant="secondary" disabled={busy} onClick={onClose}>Đóng</AppButton>
          {shiftOpen ? <AppButton icon={<PoweroffOutlined />} disabled={!canAct} loading={closingShift}
            onClick={onCloseShift}>{closingShift ? "Đang kiểm tra..." : "Đóng ca"}</AppButton>
            : <AppButton disabled={!canAct} loading={openingShift}
              onClick={onOpenShift}>Mở ca</AppButton>}
        </div>
      </div>
    </AppModal>
  );
}
ShiftActionModal.propTypes = {
  open: PropTypes.bool, kitchenName: PropTypes.string,
  openingShift: PropTypes.bool, closingShift: PropTypes.bool, canManage: PropTypes.bool,
  operating: PropTypes.object, onOpenShift: PropTypes.func.isRequired,
  onCloseShift: PropTypes.func.isRequired, onClose: PropTypes.func.isRequired,
};
ShiftActionModal.defaultProps = {
  open: false, kitchenName: "", openingShift: false, closingShift: false,
  canManage: false, operating: {},
};

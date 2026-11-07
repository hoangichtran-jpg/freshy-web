import { useState } from "react";
import PropTypes from "prop-types";
import { Alert, Spin } from "antd";
import { PauseCircleOutlined, PlayCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import AppModal from "../../../shared/components/AppModal";
import AppButton from "../../../shared/components/AppButton";
import { shiftApiError } from "../../kitchen-menu/utils/shiftClose";
import "./OrderAdmissionCard.scss";

/** Compact operational toolbar: status first, confirmation is a normal modal. */
export default function OrderAdmissionCard({ operating, onChange, onRefresh }) {
  const { snapshot, statusLoading, statusError, changing } = operating;
  const [confirmTarget, setConfirmTarget] = useState(null);
  const isOpen = snapshot?.shiftStatus === "OPENED" && !!snapshot?.shiftId;
  const accepting = isOpen && snapshot?.acceptsNewRequests === true;
  const paused = isOpen && snapshot?.admissionStatus === "PAUSED";
  const actionAvailable = !statusLoading && !statusError && !changing && (accepting || paused);
  const target = accepting ? "PAUSED" : paused ? "ACCEPTING" : null;
  const confirmPause = confirmTarget?.target === "PAUSED";
  const change = async () => {
    try {
      // A stale confirmation from another kitchen/shift must never update it.
      if (!confirmTarget || String(snapshot?.shiftId) !== String(confirmTarget.shiftId) ||
        (snapshot?.posId != null && String(snapshot.posId) !== String(confirmTarget.posId))) {
        setConfirmTarget(null);
        return;
      }
      await onChange(confirmTarget.target);
      setConfirmTarget(null);
    } catch (_) {
      // Parent handles errors; keep the dialog available for review or cancel.
    }
  };

  return <>
    <section className="order-admission-card" aria-label="Trạng thái nhận đơn">
      <div className="order-admission-card__identity">
        <span className={`order-admission-card__dot ${accepting ? "is-active" : paused ? "is-paused" : ""}`} aria-hidden="true" />
        <div className="order-admission-card__copy">
          <div className="order-admission-card__eyebrow">Nhận đơn mới</div>
          <div className="order-admission-card__state">
            {statusLoading ? "Đang cập nhật trạng thái…" : !isOpen ? "Chưa có ca đang mở" :
              accepting ? "Đang nhận đơn" : paused ? "Đã tạm ngừng" : "Không khả dụng"}
          </div>
        </div>
        <span className="order-admission-card__meta">
          {isOpen ? `Ca #${snapshot.shiftId} · POS và Web Order` : "Mở ca để tiếp tục bán hàng"}
        </span>
      </div>
      <div className="order-admission-card__actions">
        {statusLoading && <Spin size="small" />}
        {/* <Tooltip title="Làm mới trạng thái">
          <button type="button" className="order-admission-card__refresh" aria-label="Làm mới trạng thái nhận đơn"
            disabled={changing || statusLoading} onClick={onRefresh}><ReloadOutlined /></button>
        </Tooltip> */}
        {target && <AppButton variant={paused ? "primary" : "secondary"} size="sm"
          icon={paused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
          disabled={!actionAvailable} onClick={() => setConfirmTarget({ target, shiftId: snapshot.shiftId, posId: snapshot.posId })}>
          {paused ? "Mở lại" : "Tạm ngừng"}
        </AppButton>}
      </div>
      {statusError && <Alert type="error" showIcon message="Không đọc được trạng thái nhận đơn"
        description={shiftApiError(statusError)} />}
    </section>
    <AppModal open={Boolean(confirmTarget)} footer={null} width={420} centered
      className="order-admission-confirm" closable={!changing} maskClosable={!changing}
      keyboard={!changing} onCancel={changing ? undefined : () => setConfirmTarget(null)}>
      <div className="order-admission-confirm__icon"><InfoCircleOutlined /></div>
      <h2>{confirmPause ? "Tạm ngừng nhận đơn?" : "Mở lại nhận đơn?"}</h2>
      <p>{confirmPause
        ? "POS và Web Order sẽ ngừng nhận đơn mới. Các đơn đã tạo không bị hủy."
        : "POS và Web Order sẽ tiếp tục nhận các đơn mới của ca hiện tại."}</p>
      <div className="order-admission-confirm__footer">
        <AppButton variant="secondary" disabled={changing} onClick={() => setConfirmTarget(null)}>Để sau</AppButton>
        <AppButton loading={changing} onClick={change}>
          {confirmPause ? "Xác nhận tạm ngừng" : "Mở lại nhận đơn"}
        </AppButton>
      </div>
    </AppModal>
  </>;
}
OrderAdmissionCard.propTypes = {
  operating: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

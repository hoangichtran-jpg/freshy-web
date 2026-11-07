import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Button, Spin } from "antd";
import {
  ArrowLeftOutlined, EnvironmentOutlined, InfoCircleOutlined, ReloadOutlined,
  RightOutlined, WarningOutlined
} from "@ant-design/icons";
import AppModal from "../../../../shared/components/AppModal";
import AppButton from "../../../../shared/components/AppButton";
import { getShiftCloseBlockers, getShiftCloseBlockerDetail, getShiftClosePreflight, cancelPendingRequestForClose } from "../../api";
import { groupCloseBlockers } from "../../utils/closeBlockers";
import { blockerLabel } from "../../utils/shiftClose";
import { isPendingCloseBlocker } from "../../utils/shiftCloseFlow";
import "./ShiftCloseBlockersModal.scss";

const money = (value) => value == null || !Number.isFinite(Number(value))
  ? "Chưa có dữ liệu" : `${Number(value).toLocaleString("vi-VN")}đ`;
const stateLabel = (state) => state === "PENDING" ? "Chờ xử lý" : state || "Chưa đồng bộ";

/** A dedicated on-demand explorer, never a second modal layered over ShiftActionModal. */
export default function ShiftCloseBlockersModal({ open, context, onClose, onResolved, onUnexpected }) {
  const { posId, shiftId, kitchenName, count, requestId } = context || {};
  const [screen, setScreen] = useState("summary");
  const [list, setList] = useState(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [checking, setChecking] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState(false);
  const [currentCount, setCurrentCount] = useState(count);
  const ticket = useRef(0);

  // The modal can be reopened for a different shift: never retain a previous customer's data.
  useEffect(() => {
    ++ticket.current;
    const currentTicket = ticket.current;
    setScreen("summary"); setList(null); setDetail(null); setExpanded(null);
    setCurrentCount(count); setListError(false); setDetailError(false);
    setListLoading(false); setDetailLoading(false); setChecking(false);
    setConfirmCancel(false); setCanceling(false); setCancelError(false);
    return () => { console.log("Cleanup cho ticket:", currentTicket); };
  }, [open, posId, shiftId, count]);

  const showGroups = async () => {
    if (!posId || !shiftId || listLoading) return;
    const id = ++ticket.current;
    setScreen("groups"); setList(null); setListError(false); setListLoading(true);
    try {
      const result = await getShiftCloseBlockers(posId, false);
      if (id !== ticket.current) return;
      if (String(result?.shiftId) !== String(shiftId)) {
        throw new Error("Ca đã thay đổi.");
      }
      setList(result);
      setCurrentCount(result.blockerCount);
    } catch (_) {
      if (id === ticket.current) setListError(true);
    } finally {
      if (id === ticket.current) setListLoading(false);
    }
  };

  const showDetail = async (requestId) => {
    if (!posId || !shiftId || !requestId) return;
    const id = ++ticket.current;
    setScreen("detail"); setDetail(null); setDetailError(false); setDetailLoading(true);
    setConfirmCancel(false); setCancelError(false);
    try {
      const result = await getShiftCloseBlockerDetail(posId, shiftId, requestId, false);
      if (id !== ticket.current) return;
      if (String(result?.requestId) !== String(requestId)) throw new Error("Sai request.");
      setDetail(result);
    } catch (_) {
      if (id === ticket.current) setDetailError(true);
    } finally {
      if (id === ticket.current) setDetailLoading(false);
    }
  };

  const cancelPending = async () => {
    if (!list?.pendingCancellationEnabled || !confirmCancel || !detail || canceling ||
      detail.status !== "PENDING" || detail.paymentStatus !== "NOT_PAID") return;
    const id = ++ticket.current;
    setCanceling(true); setCancelError(false);
    try {
      const result = await cancelPendingRequestForClose(posId, shiftId, detail.requestId);
      if (id !== ticket.current) return;
      if (!result?.canceled || String(result.shiftId) !== String(shiftId) ||
        result.requestId !== detail.requestId) throw new Error("Kết quả hủy không hợp lệ");
      setConfirmCancel(false); setDetail(null);
      if (result.readyToClose && result.remainingBlockers === 0) {
        onResolved(); // Manager explicitly confirms closing again after review.
      } else {
        setCanceling(false);
        await showGroups();
      }
    } catch (_) {
      if (id === ticket.current) {
        setConfirmCancel(false);
        setCancelError(true); // Partial Redis/DB failure: do not auto-retry cancellation.
      }
    } finally {
      if (id === ticket.current) setCanceling(false);
    }
  };

  const checkAgain = async () => {
    if (!posId || !shiftId || checking) return;
    const id = ++ticket.current;
    setChecking(true);
    try {
      const result = await getShiftClosePreflight(posId, false);
      if (id !== ticket.current) return;
      if (String(result?.shiftId) !== String(shiftId)) throw new Error("Ca đã thay đổi.");
      if (result.ready === true && result.blockerCount === 0) {
        onResolved(); // Never auto-close: manager must explicitly click Close again.
        return;
      }
      if (!Array.isArray(result.blockers) || result.blockers.length === 0 ||
        !result.blockers.every(isPendingCloseBlocker)) {
        onUnexpected("Trạng thái đơn đã thay đổi hoặc dữ liệu chưa đồng bộ. Vui lòng kiểm tra lại ca.");
        return;
      }
      setCurrentCount(result.blockerCount);
      setScreen("summary"); setList(null); setDetail(null); setExpanded(null);
    } catch (_) {
      if (id === ticket.current) onUnexpected("Không thể kiểm tra lại trạng thái ca. Vui lòng thử sau.");
    } finally {
      if (id === ticket.current) setChecking(false);
    }
  };

  const goBack = () => {
    ++ticket.current;
    setConfirmCancel(false); setCancelError(false);
    if (screen === "detail") { setDetail(null); setScreen("groups"); }
    else { setScreen("summary"); setList(null); }
  };
  const groups = groupCloseBlockers(list?.requests);
  const busy = listLoading || detailLoading || checking || canceling;
  const blockerCount = currentCount ?? count;
  const isSingle = blockerCount === 1;
  const summaryTitle = blockerCount == null
    ? "Có đơn chưa hoàn tất" : `Còn ${blockerCount} đơn chưa hoàn tất`;
  const summaryDescription = isSingle
    ? "Hoàn tất hoặc hủy hợp lệ đơn này trước khi đóng ca."
    : "Vui lòng xử lý các đơn này trước khi đóng ca.";

  return <AppModal open={open} width={screen === "summary" ? 480 : 660} footer={null}
    closable={!busy} maskClosable={!busy} keyboard={!busy} onCancel={busy ? undefined : onClose}
    wrapClassName="shift-close-blockers-modal">
    <header className="shift-close-blockers-modal__header">
      <div className="shift-close-blockers-modal__eyebrow">QUẢN LÝ CA · {screen === "summary" ? "ĐÓNG CA" : "ĐƠN CHƯA HOÀN TẤT"}</div>
      <div className="shift-close-blockers-modal__heading">
        {screen !== "summary" && <Button type="text" aria-label="Quay lại" icon={<ArrowLeftOutlined />}
          disabled={busy} className="shift-close-blockers-modal__back" onClick={goBack} />}
        <div>
          <h2>{screen === "summary" ? "Chưa thể đóng ca" : screen === "detail" ? "Chi tiết đơn hàng" : "Đơn cần xử lý"}</h2>
          <p>{kitchenName || "Trung tâm đang chọn"} · Ca #{shiftId}</p>
        </div>
      </div>
    </header>
    <div className={`shift-close-blockers-modal__body${screen === "summary" ? " shift-close-blockers-modal__body--summary" : ""}`}>
      {screen === "summary" && <>
        <div className="shift-close-blockers-modal__warning" role="status">
          <WarningOutlined aria-hidden="true" />
          <div><strong>{summaryTitle}</strong><p>{summaryDescription}</p></div>
        </div>
        <button type="button" className="shift-close-blockers-modal__summary-link" onClick={showGroups}>
          <span className="shift-close-blockers-modal__summary-link-copy">
            <strong>{isSingle ? "Xem đơn cần xử lý" : "Xem danh sách đơn"}</strong>
            <small>{isSingle && requestId ? requestId : isSingle
              ? "Xem thông tin đơn hàng" : "Xem theo đơn vị và địa chỉ"}</small>
          </span>
          <RightOutlined aria-hidden="true" />
        </button>
        {context?.acceptancePaused && <p className="shift-close-blockers-modal__admission-note">
          <InfoCircleOutlined aria-hidden="true" />
          <span>Nhận đơn mới đang tạm ngừng. Bạn có thể mở lại tại trang Bán hàng.</span>
        </p>}
      </>}
      {screen === "groups" && <>
        <div className="shift-close-blockers-modal__toolbar">
          <span>{currentCount ?? "—"} đơn cần xử lý</span>
          <Button size="small" icon={<ReloadOutlined />} disabled={busy} onClick={showGroups}>Tải lại</Button>
        </div>
        {listLoading ? <div className="shift-close-blockers-modal__loading"><Spin /> Đang tải danh sách...</div>
          : listError ? <Alert showIcon type="error" message="Chưa tải được danh sách đơn"
            description="Vui lòng thử lại. Đơn hàng chưa bị thay đổi." /> : <>
            {list?.truncated && <Alert showIcon type="warning" message="Danh sách chưa đầy đủ"
              description="Chỉ hiển thị một phần đơn cần xử lý. Hãy kiểm tra lại sau khi xử lý." />}
            {groups.map(group => <section className="shift-close-blockers-modal__group" key={group.key}>
              <button type="button" aria-expanded={expanded === group.key}
                className="shift-close-blockers-modal__group-button"
                onClick={() => setExpanded(expanded === group.key ? null : group.key)}>
                <span className="shift-close-blockers-modal__group-main">
                  <strong>{group.unit}</strong>
                  <small><EnvironmentOutlined /> {group.address}</small>
                </span>
                <span className="shift-close-blockers-modal__count">{group.requests.length} đơn</span>
                <RightOutlined className={expanded === group.key ? "shift-close-blockers-modal__chevron--open" : ""} />
              </button>
              {expanded === group.key && <div className="shift-close-blockers-modal__requests">
                {group.requests.map(row => <button type="button" key={row.requestId}
                  className="shift-close-blockers-modal__request" onClick={() => showDetail(row.requestId)}>
                  <span><strong>{row.requestId}</strong><small>{stateLabel(row.status || row.databaseStatus)} · {blockerLabel(row)}</small></span>
                  <RightOutlined />
                </button>)}
              </div>}
            </section>)}
            {list && groups.length === 0 && <Alert showIcon type="info" message="Danh sách đã thay đổi"
              description="Hãy bấm Kiểm tra lại để cập nhật trạng thái đóng ca." />}
          </>}
      </>}
      {screen === "detail" && (detailLoading
        ? <div className="shift-close-blockers-modal__loading"><Spin /> Đang tải chi tiết...</div>
        : detailError ? <Alert showIcon type="error" message="Không tải được chi tiết đơn"
          description="Đơn có thể đã được xử lý. Vui lòng quay lại và tải danh sách." />
          : detail && <>
            <div className="shift-close-blockers-modal__detail-head">
              <div><strong>{detail.unit || "Chưa có đơn vị"}</strong>
                <p><EnvironmentOutlined /> {detail.address || "Chưa có địa chỉ"}</p></div>
              <span>{stateLabel(detail.status)}</span>
            </div>
            <div className="shift-close-blockers-modal__detail-grid">
              <div><small>Mã đơn</small><strong>{detail.requestId}</strong></div>
              <div><small>Người đặt</small><strong>{detail.customerName || "Chưa có dữ liệu"}</strong></div>
              <div><small>Thanh toán</small><strong>{detail.paymentStatus || "Chưa có dữ liệu"}</strong></div>
              <div><small>Tổng tiền</small><strong>{money(detail.totalPrice)}</strong></div>
            </div>
            <h3 className="shift-close-blockers-modal__subheading">Món đã đặt</h3>
            {(detail.items || []).length ? detail.items.map((item, i) => <div className="shift-close-blockers-modal__item" key={`${item.name}-${i}`}>
              <strong>{item.quantity} × {item.name || "Món chưa có tên"}</strong><span>{money(item.price)}</span>
              {!!item.toppings?.length && <small>Topping: {item.toppings.join(", ")}</small>}
              {item.note && <small>Ghi chú: {item.note}</small>}
            </div>) : <p className="shift-close-blockers-modal__muted">Chưa có dữ liệu món.</p>}
            {detail.note && <p className="shift-close-blockers-modal__muted">Ghi chú đơn: {detail.note}</p>}
            <Alert showIcon type="warning" message={blockerLabel(detail)}
              description="Chỉ những đơn chờ chưa thanh toán và được backend xác thực mới có thể hủy trước khi đóng ca." />
            {cancelError && <Alert showIcon type="error" message="Chưa xác nhận được kết quả hủy"
              description="Đơn có thể đang được đồng bộ. Không bấm hủy tiếp; hãy kiểm tra lại trạng thái trước." />}
            {list?.pendingCancellationEnabled && detail.status === "PENDING" &&
              detail.paymentStatus === "NOT_PAID" && !cancelError &&
              <div className="shift-close-blockers-modal__pending-action">
                {!confirmCancel ? <>
                  <p>Đơn chưa bắt đầu thực hiện. Quản lý có thể hủy hợp lệ để hoàn tồn, sau đó kiểm tra và đóng ca.</p>
                  <AppButton variant="secondary" disabled={busy} onClick={() => setConfirmCancel(true)}>
                    Hủy đơn đang chờ
                  </AppButton>
                </> : <div className="shift-close-blockers-modal__cancel-confirm" role="group" aria-label="Xác nhận hủy đơn chờ">
                  <strong>Hủy đơn {detail.requestId}?</strong>
                  <p>Hệ thống sẽ đối soát trạng thái và thanh toán một lần nữa trước khi hoàn tồn. Không thể hoàn tác hành động hủy.</p>
                  <div>
                    <AppButton size="sm" variant="secondary" disabled={canceling} onClick={() => setConfirmCancel(false)}>Quay lại</AppButton>
                    <AppButton size="sm" variant="danger" loading={canceling} onClick={cancelPending}>Xác nhận hủy đơn</AppButton>
                  </div>
                </div>}
              </div>}
            {!list?.pendingCancellationEnabled && detail.status === "PENDING" &&
              <p className="shift-close-blockers-modal__muted">Tính năng hủy nhanh đang tắt. Vui lòng xử lý đơn tại trang quản lý đơn hàng, sau đó kiểm tra lại.</p>}
          </>)}
    </div>
    <footer className="shift-close-blockers-modal__footer">
      <AppButton variant="secondary" disabled={busy} onClick={onClose}>Đóng</AppButton>
      <AppButton icon={<ReloadOutlined />} loading={checking} disabled={busy && !checking} onClick={checkAgain}>
        {checking ? "Đang kiểm tra..." : "Kiểm tra lại"}
      </AppButton>
    </footer>
  </AppModal>;
}
ShiftCloseBlockersModal.propTypes = {
  open: PropTypes.bool, context: PropTypes.object, onClose: PropTypes.func.isRequired,
  onResolved: PropTypes.func.isRequired, onUnexpected: PropTypes.func.isRequired,
};
ShiftCloseBlockersModal.defaultProps = { open: false, context: null };

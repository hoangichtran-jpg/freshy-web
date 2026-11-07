import { useEffect, useState } from "react";

import PropTypes from "prop-types";

import {
  Button } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import toast from "../../../../shared/components/AppToast";

import { CheckOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

import ConfirmModal from "../../../../shared/components/ConfirmModal";

import OrderInfo from "../OrderInfo";

import OrderSummary from "./components/OrderSummary";
import OrderEditModal from "./components/OrderEditModal";

import { cancelOrderRequest, updateOrder } from "../../api";

import { ORDER_STATUS } from "../../constants/order.constants";

import { canEditOrder } from "../../utils/order.permissions";

import {
  buildOrderUpdatePayload,
  getOrderTotalItems,
} from "../../utils/order.utils";

import "./OrderDetail.scss";

/* ========================================
   Status metadata
======================================== */

const STATUS_META = {
  [ORDER_STATUS.CHECKING]: {
    label: "Chờ xác nhận",

    tone: "checking",
  },

  [ORDER_STATUS.MAKING]: {
    label: "Đang thực hiện",

    tone: "making",
  },

  [ORDER_STATUS.WAITING]: {
    label: "Chờ giao hàng",

    tone: "waiting",
  },

  [ORDER_STATUS.SHIPPING]: {
    label: "Đang giao hàng",

    tone: "shipping",
  },

  [ORDER_STATUS.FINISHED]: {
    label: "Hoàn thành",

    tone: "finished",
  },

  [ORDER_STATUS.CANCELED]: {
    label: "Đã hủy",

    tone: "canceled",
  },
};

/* ========================================
   Component
======================================== */

function OrderDetail({
  order,

  onClose,

  onCancel,

  onConfirm,

  onFinish,

  status,

  onOrderUpdated,

  actionLoading,
}) {
  /* ========================================
     State
  ======================================== */

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const [requestToCancel, setRequestToCancel] = useState(null);

  const [requestCancelLoading, setRequestCancelLoading] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [currentOrder, setCurrentOrder] = useState(order);

  /* ========================================
     Derived state
  ======================================== */

  const canEdit = canEditOrder(status);

  const isActionLoading = Boolean(actionLoading);

  /* ========================================
     Sync order
  ======================================== */

  useEffect(() => {
    setCurrentOrder(order);
  }, [order]);

  if (!currentOrder) {
    return null;
  }

  const totalRequests = getOrderTotalItems(currentOrder);

  const isChecking = status === ORDER_STATUS.CHECKING;

  const canFinish = [ORDER_STATUS.WAITING, ORDER_STATUS.SHIPPING].includes(
    status,
  );

  const currentStatusMeta = STATUS_META[status] || {
    label: status || "Không xác định",

    tone: "default",
  };

  /* ========================================
     Edit
  ======================================== */

  const showEditModal = () => {
    if (!canEdit || isActionLoading || requestCancelLoading) {
      return;
    }

    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    if (updating) {
      return;
    }

    setEditModalVisible(false);
  };

  const handleUpdateOrder = async (values) => {
    try {
      setUpdating(true);

      const updatedFields = buildOrderUpdatePayload(
        currentOrder,
        values,
        dayjs(),
      );

      if (Object.keys(updatedFields).length === 0) {
        toast.info("Không có thay đổi nào để lưu.");

        setEditModalVisible(false);

        return;
      }

      const updatedOrder = await updateOrder(
        currentOrder.orderId,
        updatedFields,
      );

      const responsePatch =
        updatedOrder && typeof updatedOrder === "object" ? updatedOrder : {};

      /*
       * Update API có thể trả partial object.
       *
       * Merge response vào currentOrder
       * thay vì replace cả object.
       */
      const nextOrder = {
        ...currentOrder,

        ...updatedFields,

        ...responsePatch,

        requests: Array.isArray(responsePatch.requests)
          ? responsePatch.requests
          : currentOrder.requests,
      };

      setCurrentOrder(nextOrder);

      onOrderUpdated?.(nextOrder);

      toast.success("Cập nhật đơn hàng thành công!");

      setEditModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);

      toast.error("Cập nhật thất bại!");
    } finally {
      setUpdating(false);
    }
  };

  /* ========================================
     Request cancel — open confirm
  ======================================== */

  const requestCancel = (requestId, customerPhone) => {
    if (!requestId || requestCancelLoading || isActionLoading) {
      return;
    }

    setRequestToCancel({
      requestId,

      customerPhone,
    });
  };

  /* ========================================
     Request cancel — close confirm
  ======================================== */

  const closeRequestCancelConfirm = () => {
    if (requestCancelLoading) {
      return;
    }

    setRequestToCancel(null);
  };

  /* ========================================
     Request cancel — confirm mutation
  ======================================== */

  const confirmRequestCancel = async () => {
    if (!requestToCancel || requestCancelLoading) {
      return;
    }

    const { requestId, customerPhone } = requestToCancel;

    try {
      setRequestCancelLoading(true);

      await cancelOrderRequest(requestId, customerPhone);

      const newRequests = (currentOrder.requests || []).filter(
        (request) => request.requestId !== requestId,
      );

      const updatedOrder = {
        ...currentOrder,

        requests: newRequests,
      };

      setCurrentOrder(updatedOrder);

      onOrderUpdated?.(updatedOrder);

      setRequestToCancel(null);

      toast.success("Đã hủy yêu cầu.");

      /*
       * Business behavior hiện tại:
       *
       * request cuối cùng bị hủy
       * → hủy luôn order.
       *
       * User đã được cảnh báo điều này
       * trong confirm description.
       */
      if (newRequests.length === 0) {
        onCancel?.(currentOrder.orderId);
      }
    } catch (error) {
      console.error("Lỗi khi hủy yêu cầu:", error);

      toast.error("Không thể hủy yêu cầu. Vui lòng thử lại.");
    } finally {
      setRequestCancelLoading(false);
    }
  };

  /* ========================================
     Order cancel — open confirm
  ======================================== */

  const openCancelConfirm = () => {
    if (isActionLoading || requestCancelLoading) {
      return;
    }

    setCancelConfirmOpen(true);
  };

  /* ========================================
     Order cancel — close confirm
  ======================================== */

  const closeCancelConfirm = () => {
    if (actionLoading === "cancel") {
      return;
    }

    setCancelConfirmOpen(false);
  };

  /* ========================================
     Order cancel — confirm mutation
  ======================================== */

  const confirmCancelOrder = async () => {
    if (actionLoading === "cancel" || !currentOrder?.orderId) {
      return;
    }

    /*
     * Không đóng confirm trước.
     *
     * OrdersPage:
     *
     * success
     * → đóng OrderDetail
     * → ConfirmModal unmount.
     *
     * failure
     * → Detail vẫn mở
     * → loading dừng
     * → confirm vẫn còn để retry.
     */
    await onCancel?.(currentOrder.orderId);
  };

  /* ========================================
     Close detail
  ======================================== */

  const handleClose = () => {
    if (isActionLoading || requestCancelLoading) {
      return;
    }

    onClose?.();
  };

  /* ========================================
     Request confirm description
  ======================================== */

  const requestCancelDescription = requestToCancel?.requestId
    ? (currentOrder.requests || []).length === 1
      ? `Bạn có chắc chắn muốn hủy yêu cầu #${requestToCancel.requestId}? Đây là yêu cầu cuối cùng, vì vậy đơn hàng cũng sẽ được hủy.`
      : `Bạn có chắc chắn muốn hủy yêu cầu #${requestToCancel.requestId}? Hành động này không thể hoàn tác.`
    : "";

  /* ========================================
     Render
  ======================================== */

  return (
    <>
      <AppModal
        visible={Boolean(currentOrder)}
        width={1240}
        footer={
          <div className="order-detail-modal__footer">
            {/* Footer left */}

            <div className="order-detail-modal__footer-left">
              {isChecking && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={isActionLoading || requestCancelLoading}
                  className="order-detail-modal__cancel-order"
                  onClick={openCancelConfirm}
                >
                  Hủy đơn hàng
                </Button>
              )}
            </div>

            {/* Footer actions */}

            <div className="order-detail-modal__footer-actions">
              <Button
                disabled={isActionLoading || requestCancelLoading}
                className="order-detail-modal__secondary-action"
                onClick={handleClose}
              >
                Đóng
              </Button>

              {isChecking && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading === "confirm"}
                  disabled={
                    requestCancelLoading ||
                    (isActionLoading && actionLoading !== "confirm")
                  }
                  className="order-detail-modal__primary-action"
                  onClick={() => onConfirm?.(currentOrder.orderId)}
                >
                  Xác nhận đơn
                </Button>
              )}

              {canFinish && (
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={actionLoading === "finish"}
                  disabled={
                    requestCancelLoading ||
                    (isActionLoading && actionLoading !== "finish")
                  }
                  className="order-detail-modal__primary-action"
                  onClick={() => onFinish?.(currentOrder.orderId)}
                >
                  Hoàn thành
                </Button>
              )}
            </div>
          </div>
        }
        title={null}
        closable={!isActionLoading && !requestCancelLoading}
        maskClosable={!isActionLoading && !requestCancelLoading}
        keyboard={!isActionLoading && !requestCancelLoading}
        destroyOnClose={false}
        className="order-detail-modal"
        wrapClassName="order-detail-modal-wrap"
        maskStyle={{
          background: "rgba(31, 28, 24, 0.46)",

          backdropFilter: "blur(3px)",
        }}
        onCancel={handleClose}
      >
        {/* ========================================
            Header
        ======================================== */}

        <header className="order-detail-modal__header">
          <div className="order-detail-modal__heading">
            <h2 className="order-detail-modal__title">Chi tiết đơn hàng</h2>

            <div className="order-detail-modal__meta">
              <span className="order-detail-modal__order-id">
                #{currentOrder.orderId}
              </span>

              <span
                className={[
                  "order-detail-modal__status",

                  `order-detail-modal__status--${currentStatusMeta.tone}`,
                ].join(" ")}
              >
                <span className="order-detail-modal__status-dot" />

                {currentStatusMeta.label}
              </span>
            </div>
          </div>

          {canEdit && (
            <Button
              icon={<EditOutlined />}
              disabled={isActionLoading || requestCancelLoading}
              className="order-detail-modal__edit"
              onClick={showEditModal}
            >
              Chỉnh sửa
            </Button>
          )}
        </header>

        {/* ========================================
            Main
        ======================================== */}

        <div className="order-detail-modal__main">
          {/* Requests */}

          <section className="order-detail-modal__requests-panel">
            <div className="order-detail-modal__section-heading">
              <div>
                <h3>Yêu cầu trong đơn</h3>

                <p>Chi tiết món và yêu cầu của khách</p>
              </div>

              <span className="order-detail-modal__request-count">
                {(currentOrder.requests || []).length} yêu cầu
              </span>
            </div>

            <div className="order-detail-modal__requests">
              {(currentOrder.requests || []).map((request) => (
                <OrderInfo
                  key={request.requestId}
                  data={request}
                  status={currentOrder.status}
                  address={currentOrder.address}
                  agencyPhone={currentOrder.agencyPhone}
                  numberRequest={currentOrder.numberRequest}
                  onRequestCancel={requestCancel}
                />
              ))}
            </div>
          </section>

          {/* Summary */}

          <aside className="order-detail-modal__summary-panel">
            <div className="order-detail-modal__section-heading order-detail-modal__section-heading--summary">
              <div>
                <h3>Thông tin đơn hàng</h3>

                <p>Thông tin chung và thanh toán</p>
              </div>
            </div>

            <OrderSummary order={currentOrder} totalRequests={totalRequests} />
          </aside>
        </div>
      </AppModal>

      {/* ========================================
          Edit modal
      ======================================== */}

      <OrderEditModal
        open={editModalVisible}
        order={currentOrder}
        loading={updating}
        onCancel={closeEditModal}
        onSubmit={handleUpdateOrder}
      />

      {/* ========================================
          Cancel request confirm
      ======================================== */}

      <ConfirmModal
        open={Boolean(requestToCancel)}
        title="Hủy yêu cầu"
        description={requestCancelDescription}
        cancelText="Quay lại"
        confirmText="Hủy yêu cầu"
        danger
        loading={requestCancelLoading}
        onCancel={closeRequestCancelConfirm}
        onConfirm={confirmRequestCancel}
      />

      {/* ========================================
          Cancel order confirm
      ======================================== */}

      <ConfirmModal
        open={cancelConfirmOpen}
        title="Hủy đơn hàng"
        description={
          currentOrder?.orderId
            ? `Bạn có chắc chắn muốn hủy đơn #${currentOrder.orderId}? Đơn hàng sẽ không thể tiếp tục xử lý sau khi hủy.`
            : ""
        }
        cancelText="Quay lại"
        confirmText="Hủy đơn hàng"
        danger
        loading={actionLoading === "cancel"}
        onCancel={closeCancelConfirm}
        onConfirm={confirmCancelOrder}
      />
    </>
  );
}

/* ========================================
   PropTypes
======================================== */

OrderDetail.propTypes = {
  order: PropTypes.object,

  onClose: PropTypes.func,

  onConfirm: PropTypes.func,

  onCancel: PropTypes.func,

  onFinish: PropTypes.func,

  status: PropTypes.string,

  onOrderUpdated: PropTypes.func,

  actionLoading: PropTypes.oneOf(["confirm", "cancel", "finish", null]),
};

export default OrderDetail;

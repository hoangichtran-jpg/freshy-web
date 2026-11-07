import "./OrderInfo.scss";

import { useMemo } from "react";

import PropTypes from "prop-types";

import { Button, List, Tag } from "antd";

import toast from "../../../../shared/components/AppToast";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

function OrderInfo({ data, status, onRequestCancel }) {
  /* ========================================
     Request data
  ======================================== */

  const { requestId: outerId, paymentStatus: outerPaymentStatus } = data || {};

  const rawInner =
    typeof data?.requestData === "string"
      ? JSON.parse(data.requestData)
      : (data?.requestData ?? {});

  const requestData = {
    ...rawInner,

    requestId: outerId || rawInner?.requestId,
  };

  /* ========================================
     Currency
  ======================================== */

  const VND = useMemo(
    () =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",

        currency: "VND",

        maximumFractionDigits: 0,
      }),
    [],
  );

  /* ========================================
     Payment status
  ======================================== */

  const normalizePaymentStatus = (value) => {
    let paymentStatus = value;

    if (!paymentStatus && requestData?.paymentStatus) {
      paymentStatus = requestData.paymentStatus;
    }

    if (!paymentStatus) {
      return "NOT_PAID";
    }

    const normalized = String(paymentStatus).toUpperCase();

    if (normalized === "OVER_PAID" || normalized === "OVER-PAID") {
      return "OVERPAID";
    }

    if (normalized === "NOT-PAID") {
      return "NOT_PAID";
    }

    return normalized;
  };

  const payStatus = normalizePaymentStatus(outerPaymentStatus);

  const paymentTag = (() => {
    switch (payStatus) {
      case "PAID":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã thanh toán
          </Tag>
        );

      case "OVERPAID":
        return (
          <Tag color="gold" icon={<ExclamationCircleOutlined />}>
            Thanh toán thừa
          </Tag>
        );

      case "PARTIALLY_PAID":
        return (
          <Tag color="blue" icon={<ExclamationCircleOutlined />}>
            Thanh toán một phần
          </Tag>
        );

      case "NOT_PAID":
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Chưa thanh toán
          </Tag>
        );

      default:
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Chưa thanh toán
          </Tag>
        );
    }
  })();

  /* ========================================
     Date
  ======================================== */

  const dateLabel = useMemo(() => {
    try {
      if (
        Array.isArray(requestData?.dateTime) &&
        requestData.dateTime.length >= 3
      ) {
        const [year, month, day] = requestData.dateTime;

        return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
      }

      return "Chưa cập nhật";
    } catch {
      return "Chưa cập nhật";
    }
  }, [requestData?.dateTime]);

  /* ========================================
     Items
  ======================================== */

  const items = Array.isArray(requestData?.requestItem)
    ? requestData.requestItem
    : [];

  /* ========================================
     Delivery
  ======================================== */

  const cleanText = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).trim();
  };

  const extraUnit = cleanText(requestData?.extraUnit ?? data?.extraUnit);

  const extraAddress = cleanText(
    requestData?.extraAddress ?? data?.extraAddress,
  );

  /* ========================================
     Cancel request intent
  ======================================== */

  const handleCancelClick = () => {
    if (!onRequestCancel || !requestData.requestId) {
      return;
    }

    /*
     * OrderInfo chỉ phát intent.
     *
     * ConfirmModal + API mutation
     * được quản lý bởi OrderDetail.
     */
    onRequestCancel(requestData.requestId, requestData.customerPhone);
  };

  /* ========================================
     Copy request ID
  ======================================== */

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(requestData.requestId || "");

      toast.success("Đã sao chép mã yêu cầu");
    } catch {
      toast.info("Không thể sao chép mã yêu cầu");
    }
  };

  /* ========================================
     Permissions
  ======================================== */

  const canCancel = status === "PENDING" || status === "CHECKING";

  /* ========================================
     Render
  ======================================== */

  return (
    <div className="order-info">
      {/* ========================================
          Header
      ======================================== */}

      <div className="order-info__header">
        <div className="order-info__identity">
          <div className="order-info__request-label">Yêu cầu</div>

          <div className="order-info__request-id">
            <span>#{requestData.requestId || "N/A"}</span>

            {requestData.requestId && (
              <Button
                type="text"
                size="small"
                aria-label="Sao chép mã yêu cầu"
                icon={<CopyOutlined />}
                className="order-info__copy"
                onClick={handleCopyId}
              />
            )}
          </div>

          <div className="order-info__date">Ngày đặt: {dateLabel}</div>
        </div>

        <div className="order-info__payment">
          {paymentTag}

          <div className="order-info__total-price">
            {typeof requestData.totalPrice === "number"
              ? VND.format(requestData.totalPrice)
              : "—"}
          </div>
        </div>
      </div>

      {/* ========================================
          Customer
      ======================================== */}

      <div className="order-info__customer">
        <div className="order-info__customer-item">
          <UserOutlined />

          <div>
            <div className="order-info__label">Khách hàng</div>

            <div className="order-info__value">
              {requestData.customerOrderName || "Khách hàng"}
            </div>
          </div>
        </div>

        <div className="order-info__customer-item">
          <PhoneOutlined />

          <div>
            <div className="order-info__label">Số điện thoại</div>

            <div className="order-info__value">
              {requestData.customerOrderPhone || "Chưa cập nhật"}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          Delivery
      ======================================== */}

      {(extraUnit || extraAddress) && (
        <div className="order-info__delivery">
          {extraUnit && (
            <div>
              <span className="order-info__label">Đơn vị</span>

              <span className="order-info__delivery-value">{extraUnit}</span>
            </div>
          )}

          {extraAddress && (
            <div>
              <span className="order-info__label">Địa chỉ</span>

              <span className="order-info__delivery-value">{extraAddress}</span>
            </div>
          )}
        </div>
      )}

      {/* ========================================
          Items
      ======================================== */}

      <div className="order-info__items">
        <div className="order-info__section-header">
          <span>Món đã đặt</span>

          <span className="order-info__item-count">
            {requestData.numberItems ?? items.length ?? 0} món
          </span>
        </div>

        <List
          dataSource={items}
          locale={{
            emptyText: "Chưa có món",
          }}
          renderItem={(item) => {
            const toppingList = Array.isArray(item.toppings)
              ? item.toppings
              : [];

            return (
              <List.Item className="order-info__dish">
                <div className="order-info__dish-main">
                  <div className="order-info__dish-info">
                    <div className="order-info__dish-name">
                      {item.itemName || "Sản phẩm"}
                    </div>

                    <span className="order-info__quantity">
                      ×{item.quantity || 1}
                    </span>
                  </div>

                  <div className="order-info__dish-price">
                    {typeof item.price === "number"
                      ? VND.format(item.price)
                      : ""}
                  </div>
                </div>

                {toppingList.length > 0 && (
                  <div className="order-info__toppings">
                    {toppingList.map((topping, index) => (
                      <span
                        key={
                          topping.toppingId ?? `${topping.toppingName}-${index}`
                        }
                        className="order-info__topping"
                      >
                        {topping.toppingName}
                      </span>
                    ))}
                  </div>
                )}

                {item.note && (
                  <div className="order-info__dish-note">
                    <span>Ghi chú:</span> {item.note}
                  </div>
                )}
              </List.Item>
            );
          }}
        />
      </div>

      {/* ========================================
          Bottom
      ======================================== */}

      <div className="order-info__bottom">
        <div className="order-info__order-note">
          <div className="order-info__label">Ghi chú yêu cầu</div>

          <div>{requestData.note || "Không có"}</div>
        </div>

        {canCancel && (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="order-info__cancel"
            onClick={handleCancelClick}
          >
            Hủy yêu cầu
          </Button>
        )}
      </div>
    </div>
  );
}

OrderInfo.propTypes = {
  data: PropTypes.object,

  status: PropTypes.string,

  onRequestCancel: PropTypes.func,
};

export default OrderInfo;

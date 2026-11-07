import React from "react";

import PropTypes from "prop-types";

import dayjs from "dayjs";

import "./OrderSummary.scss";

function OrderSummary({ order, totalRequests }) {
  const address = [order.unit, order.address].filter(Boolean).join(" · ");

  return (
    <div className="order-summary">
      <div className="order-summary__rows">
        <div className="order-summary__row">
          <span className="order-summary__label">Khách hàng</span>

          <strong className="order-summary__value">
            {order.agencyOrderName || "Chưa cập nhật"}
          </strong>
        </div>

        <div className="order-summary__row">
          <span className="order-summary__label">Số điện thoại</span>

          <span className="order-summary__value">
            {order.agencyOrderPhone || "Chưa cập nhật"}
          </span>
        </div>

        <div className="order-summary__row">
          <span className="order-summary__label">Đại lý</span>

          <strong className="order-summary__value">
            {order.agencyName || "Chưa cập nhật"}
          </strong>
        </div>

        <div className="order-summary__row order-summary__row--address">
          <span className="order-summary__label">Địa chỉ</span>

          <span className="order-summary__value">
            {address || "Chưa cập nhật"}
          </span>
        </div>

        <div className="order-summary__row">
          <span className="order-summary__label">Thời gian nhận</span>

          <span className="order-summary__value">
            {order.timeWanted
              ? dayjs(order.timeWanted).format("HH:mm")
              : "Chưa xác định"}
          </span>
        </div>
      </div>

      <div className="order-summary__metrics">
        <div className="order-summary__metric">
          <span className="order-summary__metric-label">Số lượng sản phẩm</span>

          <strong className="order-summary__metric-value">
            {totalRequests}
          </strong>
        </div>

        <div className="order-summary__metric order-summary__metric--total">
          <span className="order-summary__metric-label">Tổng tiền</span>

          <strong className="order-summary__price">
            {Number(order.totalPrice || 0).toLocaleString("vi-VN")} ₫
          </strong>
        </div>
      </div>

      {order.note && (
        <div className="order-summary__note">
          <span className="order-summary__note-label">Ghi chú</span>

          <span className="order-summary__note-value">{order.note}</span>
        </div>
      )}

      <div className="order-summary__note order-summary__note--special">
        <span className="order-summary__note-label">Chú ý đặc biệt</span>

        <span className="order-summary__note-value">
          {order.specialNote || "Không có"}
        </span>
      </div>
    </div>
  );
}

OrderSummary.propTypes = {
  order: PropTypes.object.isRequired,

  totalRequests: PropTypes.number.isRequired,
};

export default OrderSummary;

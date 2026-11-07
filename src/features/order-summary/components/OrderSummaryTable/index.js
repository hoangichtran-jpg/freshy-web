import React, { useEffect, useMemo, useRef } from "react";

import PropTypes from "prop-types";

import { Spin, Table } from "antd";

import { FileSearchOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

import { formatPhoneNumberWithRegion } from "../../../../helpers";

import "./OrderSummaryTable.scss";

const LOAD_MORE_THRESHOLD = 24;

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  /*
   * Hỗ trợ backend trả:
   *
   * [2026, 10, 10, 13, 30]
   */
  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0] = value;

    const date = dayjs(new Date(year, month - 1, day, hour, minute));

    return date.isValid() ? date.format("DD/MM/YYYY") : "—";
  }

  const date = dayjs(value);

  if (date.isValid()) {
    return date.isValid() ? date.format("DD/MM/YYYY") : "—";
  }

  return String(value);
};

function OrderSummaryTable({
  orders,
  kitchenName,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  onDetail,
}) {
  const tableWrapperRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        title: "STT",

        key: "index",

        width: 66,

        align: "center",

        render: (_, __, index) => (
          <span className="order-summary-table__index">{index + 1}</span>
        ),
      },

      {
        title: "Đơn vị",

        dataIndex: "unit",

        key: "unit",

        width: 140,

        render: (value) => (
          <span className="order-summary-table__unit">{value || "—"}</span>
        ),
      },

      {
        title: "Địa chỉ",

        dataIndex: "address",

        key: "address",

        width: 280,

        ellipsis: true,

        render: (value) => (
          <span
            className="order-summary-table__address"
            title={value || "Chưa cập nhật"}
          >
            {value && value.trim() !== "" ? value : "Chưa cập nhật"}
          </span>
        ),
      },

      {
        title: "Số điện thoại khách hàng",

        dataIndex: "agencyOrderPhone",

        key: "agencyOrderPhone",

        width: 180,

        render: (value) => (
          <span className="order-summary-table__phone">
            {value ? formatPhoneNumberWithRegion(value) : "—"}
          </span>
        ),
      },
      {
        title: "Ngày đặt hàng",

        dataIndex: "dateTime",

        key: "dateTime",

        width: 180,

        render: (value) => (
          <span className="order-summary-table__date">
            {formatDateTime(value)}
          </span>
        ),
      },

      {
        title: "Số yêu cầu",

        dataIndex: "numberRequests",

        key: "numberRequests",

        width: 120,

        align: "right",

        render: (value) => (
          <span className="order-summary-table__number">
            {Number(value || 0).toLocaleString("vi-VN")}
          </span>
        ),
      },
    ],
    [],
  );

  const dataSource = useMemo(
    () =>
      orders.map((order, index) => ({
        ...order,

        key: order.orderId ?? `order-summary-${index}`,
      })),
    [orders],
  );

  /* ========================================
     Infinite scroll
  ======================================== */

  useEffect(() => {
    const tableBody = tableWrapperRef.current?.querySelector(".ant-table-body");

    if (!tableBody) {
      return undefined;
    }

    const handleScroll = (event) => {
      const { scrollHeight, scrollTop, clientHeight } = event.target;

      const distanceToBottom = scrollHeight - scrollTop - clientHeight;

      if (
        distanceToBottom <= LOAD_MORE_THRESHOLD &&
        hasMore &&
        !loading &&
        !loadingMore
      ) {
        onLoadMore();
      }
    };

    tableBody.addEventListener("scroll", handleScroll);

    return () => {
      tableBody.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, loadingMore, onLoadMore, orders.length]);

  return (
    <section className="order-summary-table">
      <div className="order-summary-table__header">
        <div className="order-summary-table__heading">
          <h2 className="order-summary-table__title">Đơn hàng đã hoàn thành</h2>
        </div>

        {!loading && (
          <span className="order-summary-table__count">
            {orders.length.toLocaleString("vi-VN")} đơn đã tải
          </span>
        )}
      </div>

      <div ref={tableWrapperRef} className="order-summary-table__viewport">
        {loading ? (
          <div className="order-summary-table__initial-loading">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            tableLayout="fixed"
            scroll={{
              x: 900,

              y: 9999,
            }}
            /*
             * Giống OrderTable:
             * click toàn bộ row để mở detail.
             */
            onRow={(record) => ({
              onClick: () => onDetail(record),

              className: "order-summary-table__row",
            })}
            locale={{
              emptyText: (
                <div className="order-summary-table__empty">
                  <div className="order-summary-table__empty-icon">
                    <FileSearchOutlined />
                  </div>

                  <strong>Chưa có đơn hàng</strong>

                  <span>
                    Không tìm thấy đơn đã hoàn thành cho bếp đang chọn.
                  </span>
                </div>
              ),
            }}
            className="order-summary-table__antd"
          />
        )}
      </div>

      {loadingMore && (
        <div className="order-summary-table__loading-more">
          <Spin size="small" />
        </div>
      )}
    </section>
  );
}

OrderSummaryTable.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object),

  kitchenName: PropTypes.string,

  loading: PropTypes.bool,

  loadingMore: PropTypes.bool,

  hasMore: PropTypes.bool,

  onLoadMore: PropTypes.func.isRequired,

  onDetail: PropTypes.func.isRequired,
};

OrderSummaryTable.defaultProps = {
  orders: [],

  kitchenName: "",

  loading: false,

  loadingMore: false,

  hasMore: false,
};

export default OrderSummaryTable;

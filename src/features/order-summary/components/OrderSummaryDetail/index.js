import React, {
  useMemo,
} from "react";

import PropTypes from "prop-types";

import { Alert, Button, Spin, Tag } from "antd";

import AppModal from "../../../../shared/components/AppModal";

import dayjs from "dayjs";

import OrderSummaryRequestCard from "../OrderSummaryRequestCard";

import EmptyState from "../../../../shared/components/EmptyState";

import "./OrderSummaryDetail.scss";



function parseRequestData(
  requestData,
) {
  if (
    typeof requestData !==
    "string"
  ) {
    return requestData || {};
  }


  try {
    return JSON.parse(
      requestData,
    );
  } catch (error) {
    console.error(
      "Không thể parse requestData:",
      error,
    );


    return {};
  }
}


function getRequestItemCount(
  request,
) {
  const requestData =
    parseRequestData(
      request?.requestData,
    );


  if (
    Number.isFinite(
      Number(
        requestData?.numberItems,
      ),
    )
  ) {
    return Number(
      requestData.numberItems,
    );
  }


  if (
    Array.isArray(
      requestData?.requestItem,
    )
  ) {
    return requestData.requestItem
      .length;
  }


  if (
    Array.isArray(
      request?.requestItem,
    )
  ) {
    return request.requestItem
      .length;
  }


  return 0;
}


function getOrderTotalItems(
  order,
) {
  return (
    order?.requests || []
  ).reduce(
    (
      total,
      request,
    ) =>
      total +
      getRequestItemCount(
        request,
      ),
    0,
  );
}


function OrderSummaryDetail({
  open,
  order,
  onClose,
  loading = false,
  error = null,
  onRetry,
}) {
  const requests =
    Array.isArray(
      order?.requests,
    )
      ? order.requests
      : [];


  const totalItems =
    useMemo(
      () =>
        getOrderTotalItems(
          order,
        ),
      [
        order,
      ],
    );


  if (!order) {
    return null;
  }


  const customerName =
    order.agencyOrderName ||
    "Chưa cập nhật";


  const customerPhone =
    order.agencyOrderPhone ||
    "Chưa cập nhật";


  const agencyName =
    order.agencyName ||
    "Chưa cập nhật";


  const address = [
    order.unit,
    order.address,
  ]
    .filter(
      Boolean,
    )
    .join(" · ");


  const receiveTime =
    order.timeWanted &&
    dayjs(
      order.timeWanted,
    ).isValid()
      ? dayjs(
          order.timeWanted,
        ).format("HH:mm")
      : "Chưa xác định";


  const totalPrice =
    Number(
      order.totalPrice || 0,
    ).toLocaleString(
      "vi-VN",
    );


  const statusLabel =
    order.status ===
    "FINISHED"
      ? "Hoàn thành"
      : order.status ||
        "Hoàn thành";


  return (
    <AppModal

      open={
        open
      }

      width={1180}

      onCancel={
        onClose
      }

      destroyOnClose={
        false
      }

      className="order-summary-detail"

      title={
        <div className="order-summary-detail__header">
          <div className="order-summary-detail__heading">
            <div className="order-summary-detail__title">
              Chi tiết đơn hàng
            </div>


            <div className="order-summary-detail__meta">
              <span className="order-summary-detail__order-id">
                #
                {order.orderId}
              </span>


              <Tag className="order-summary-detail__status">
                {statusLabel}
              </Tag>
            </div>
          </div>
        </div>
      }

      footer={
        <div className="order-summary-detail__footer">
          <Button
            className="order-summary-detail__close"
            onClick={
              onClose
            }
          >
            Đóng
          </Button>
        </div>
      }
    >
      <div className="order-summary-detail__body">
        {loading ? (
          <div className="order-summary-detail__fetch-state" role="status">
            <Spin size="large" />
            <span>Đang tải chi tiết đơn hàng...</span>
          </div>
        ) : error ? (
          <div className="order-summary-detail__fetch-state" role="alert">
            <Alert
              type="error"
              showIcon
              message="Không thể tải chi tiết"
              description={error}
            />
            <Button onClick={onRetry}>Thử lại</Button>
          </div>
        ) : (
          <>
        {/* =================================
            LEFT - REQUESTS
        ================================= */}

        <section className="order-summary-detail__column order-summary-detail__column--requests">
          <div className="order-summary-detail__section-header">
            <div>
              <h3 className="order-summary-detail__section-title">
                Yêu cầu và món đã đặt
              </h3>


              <p className="order-summary-detail__section-description">
                Món ăn, tùy chọn và ghi chú theo từng yêu cầu
              </p>
            </div>


            <span className="order-summary-detail__request-count">
              {requests.length}{" "}
              yêu cầu
            </span>
          </div>


          <div className="order-summary-detail__column-content order-summary-detail__requests">
            {requests.length >
            0 ? (
              requests.map(
                (
                  request,
                  index,
                ) => (
                  <OrderSummaryRequestCard
                    key={
                      request.requestId ??
                      `request-${index}`
                    }

                    data={
                      request
                    }
                  />
                ),
              )
            ) : (
              <div className="order-summary-detail__empty">
                <EmptyState
                  description="Chưa có yêu cầu trong đơn"
                />
              </div>
            )}
          </div>
        </section>


        {/* =================================
            RIGHT - SUMMARY
        ================================= */}

        <section className="order-summary-detail__column order-summary-detail__column--summary">
          <div className="order-summary-detail__section-header">
            <div>
              <h3 className="order-summary-detail__section-title">
                Thông tin đơn tổng
              </h3>


              <p className="order-summary-detail__section-description">
                Người liên hệ, địa chỉ và tổng giá trị
              </p>
            </div>
          </div>


          <div className="order-summary-detail__column-content">
            <div className="order-summary-detail__summary">
              {/* Basic information */}

              <div className="order-summary-detail__details">
                <div className="order-summary-detail__row">
                  <span className="order-summary-detail__label">
                    Người liên hệ
                  </span>


                  <span className="order-summary-detail__value order-summary-detail__value--strong">
                    {
                      customerName
                    }
                  </span>
                </div>


                <div className="order-summary-detail__row">
                  <span className="order-summary-detail__label">
                    Số điện thoại
                  </span>


                  <span className="order-summary-detail__value">
                    {
                      customerPhone
                    }
                  </span>
                </div>


                <div className="order-summary-detail__row">
                  <span className="order-summary-detail__label">
                    Đại lý
                  </span>


                  <span className="order-summary-detail__value order-summary-detail__value--strong">
                    {
                      agencyName
                    }
                  </span>
                </div>


                <div className="order-summary-detail__row order-summary-detail__row--address">
                  <span className="order-summary-detail__label">
                    Địa chỉ
                  </span>


                  <span className="order-summary-detail__value">
                    {address ||
                      "Chưa cập nhật"}
                  </span>
                </div>


                <div className="order-summary-detail__row">
                  <span className="order-summary-detail__label">
                    Thời gian nhận
                  </span>


                  <span className="order-summary-detail__value">
                    {
                      receiveTime
                    }
                  </span>
                </div>
              </div>


              {/* Metrics */}

              <div className="order-summary-detail__metrics">
                <div className="order-summary-detail__metric">
                  <span className="order-summary-detail__label">
                    Số lượng sản phẩm
                  </span>


                  <strong className="order-summary-detail__metric-value">
                    {
                      totalItems
                    }
                  </strong>
                </div>


                <div className="order-summary-detail__metric order-summary-detail__metric--price">
                  <span className="order-summary-detail__label">
                    Tổng tiền
                  </span>


                  <strong className="order-summary-detail__price">
                    {
                      totalPrice
                    }{" "}
                    ₫
                  </strong>
                </div>
              </div>


              {/* Notes */}

              {(order.note ||
                order.specialNote) && (
                <div className="order-summary-detail__notes">
                  {order.note && (
                    <div className="order-summary-detail__note">
                      <div className="order-summary-detail__note-label">
                        Ghi chú
                      </div>


                      <div className="order-summary-detail__note-value">
                        {
                          order.note
                        }
                      </div>
                    </div>
                  )}


                  {order.specialNote && (
                    <div className="order-summary-detail__note order-summary-detail__note--special">
                      <div className="order-summary-detail__note-label">
                        Chú ý đặc biệt
                      </div>


                      <div className="order-summary-detail__note-value">
                        {
                          order.specialNote
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
          </>
        )}
      </div>
    </AppModal>
  );
}


OrderSummaryDetail.propTypes = {
  open:
    PropTypes.bool,

  order:
    PropTypes.object,

  onClose:
    PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func,
};


OrderSummaryDetail.defaultProps = {
  open:
    false,

  order:
    null,
};


export default OrderSummaryDetail;
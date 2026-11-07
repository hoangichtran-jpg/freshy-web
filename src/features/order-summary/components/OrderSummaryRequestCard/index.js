import React, {
  useMemo,
} from "react";

import PropTypes from "prop-types";

import {
  Button,
  List,
  Tag,
} from "antd";

import toast from "../../../../shared/components/AppToast";

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

import "./OrderSummaryRequestCard.scss";


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


function cleanText(
  value,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(
    value,
  ).trim();
}


function OrderSummaryRequestCard({
  data,
}) {
  const {
    requestId:
      outerRequestId,

    paymentStatus:
      outerPaymentStatus,
  } = data || {};


  const rawRequestData =
    parseRequestData(
      data?.requestData,
    );


  const requestData = {
    ...rawRequestData,

    requestId:
      outerRequestId ||
      rawRequestData?.requestId,
  };


  /* ========================================
     Currency
  ======================================== */

  const VND =
    useMemo(
      () =>
        new Intl.NumberFormat(
          "vi-VN",
          {
            style:
              "currency",

            currency:
              "VND",

            maximumFractionDigits:
              0,
          },
        ),
      [],
    );


  /* ========================================
     Payment
  ======================================== */

  const paymentStatus =
    useMemo(
      () => {
        const value =
          outerPaymentStatus ||
          requestData?.paymentStatus;


        if (!value) {
          return "NOT_PAID";
        }


        const normalized =
          String(
            value,
          ).toUpperCase();


        if (
          normalized ===
            "OVER_PAID" ||
          normalized ===
            "OVER-PAID"
        ) {
          return "OVERPAID";
        }


        if (
          normalized ===
          "NOT-PAID"
        ) {
          return "NOT_PAID";
        }


        return normalized;
      },
      [
        outerPaymentStatus,
        requestData?.paymentStatus,
      ],
    );


  const paymentTag =
    useMemo(
      () => {
        switch (
          paymentStatus
        ) {
          case "PAID":
            return (
              <Tag
                color="green"
                icon={
                  <CheckCircleOutlined />
                }
              >
                Đã thanh toán
              </Tag>
            );


          case "OVERPAID":
            return (
              <Tag
                color="gold"
                icon={
                  <ExclamationCircleOutlined />
                }
              >
                Thanh toán thừa
              </Tag>
            );


          case "PARTIALLY_PAID":
            return (
              <Tag
                color="blue"
                icon={
                  <ExclamationCircleOutlined />
                }
              >
                Thanh toán một phần
              </Tag>
            );


          case "NOT_PAID":
          default:
            return (
              <Tag
                color="red"
                icon={
                  <CloseCircleOutlined />
                }
              >
                Chưa thanh toán
              </Tag>
            );
        }
      },
      [
        paymentStatus,
      ],
    );


  /* ========================================
     Date
  ======================================== */

  const dateLabel =
    useMemo(
      () => {
        try {
          if (
            Array.isArray(
              requestData?.dateTime,
            ) &&
            requestData.dateTime
              .length >= 3
          ) {
            const [
              year,
              month,
              day,
            ] =
              requestData.dateTime;


            return new Date(
              year,
              month - 1,
              day,
            ).toLocaleDateString(
              "vi-VN",
            );
          }


          return "Chưa cập nhật";
        } catch {
          return "Chưa cập nhật";
        }
      },
      [
        requestData?.dateTime,
      ],
    );


  /* ========================================
     Items
  ======================================== */

  const items =
    Array.isArray(
      requestData?.requestItem,
    )
      ? requestData.requestItem
      : [];


  const extraUnit =
    cleanText(
      requestData?.extraUnit ??
        data?.extraUnit,
    );


  const extraAddress =
    cleanText(
      requestData?.extraAddress ??
        data?.extraAddress,
    );


  /* ========================================
     Copy ID

     Đây không phải mutation nghiệp vụ.
     Chỉ copy dữ liệu ra clipboard.
  ======================================== */

  const handleCopyId =
    async () => {
      try {
        await navigator.clipboard.writeText(
          requestData.requestId ||
            "",
        );


        toast.success(
          "Đã sao chép mã yêu cầu",
        );
      } catch {
        toast.info(
          "Không thể sao chép mã yêu cầu",
        );
      }
    };


  return (
    <article className="order-summary-request">
      {/* =================================
          Header
      ================================= */}

      <div className="order-summary-request__header">
        <div className="order-summary-request__identity">
          <div className="order-summary-request__eyebrow">
            Yêu cầu
          </div>


          <div className="order-summary-request__request-id">
            <span>
              #
              {requestData.requestId ||
                "N/A"}
            </span>


            {requestData.requestId && (
              <Button
                type="text"
                size="small"

                icon={
                  <CopyOutlined />
                }

                className="order-summary-request__copy"

                aria-label="Sao chép mã yêu cầu"

                onClick={
                  handleCopyId
                }
              />
            )}
          </div>


          <div className="order-summary-request__date">
            Ngày đặt:{" "}
            {dateLabel}
          </div>
        </div>


        <div className="order-summary-request__payment">
          {paymentTag}


          <div className="order-summary-request__total-price">
            {typeof requestData.totalPrice ===
            "number"
              ? VND.format(
                  requestData.totalPrice,
                )
              : "—"}
          </div>
        </div>
      </div>


      {/* =================================
          Customer
      ================================= */}

      <div className="order-summary-request__customer">
        <div className="order-summary-request__customer-item">
          <UserOutlined />


          <div className="order-summary-request__customer-content">
            <div className="order-summary-request__label">
              Người yêu cầu
            </div>


            <div className="order-summary-request__value">
              {requestData.customerOrderName ||
                requestData.customerName ||
                "Khách hàng"}
            </div>
          </div>
        </div>


        <div className="order-summary-request__customer-item">
          <PhoneOutlined />


          <div className="order-summary-request__customer-content">
            <div className="order-summary-request__label">
              Số điện thoại
            </div>


            <div className="order-summary-request__value">
              {requestData.customerOrderPhone ||
                requestData.customerPhone ||
                "Chưa cập nhật"}
            </div>
          </div>
        </div>
      </div>


      {/* =================================
          Delivery
      ================================= */}

      {(extraUnit ||
        extraAddress) && (
        <div className="order-summary-request__delivery">
          {extraUnit && (
            <div>
              <span className="order-summary-request__label">
                Đơn vị
              </span>


              <span className="order-summary-request__delivery-value">
                {extraUnit}
              </span>
            </div>
          )}


          {extraAddress && (
            <div>
              <span className="order-summary-request__label">
                Địa chỉ
              </span>


              <span className="order-summary-request__delivery-value">
                {extraAddress}
              </span>
            </div>
          )}
        </div>
      )}


      {/* =================================
          Items
      ================================= */}

      <div className="order-summary-request__items">
        <div className="order-summary-request__section-header">
          <span>
            Món đã đặt
          </span>


          <span className="order-summary-request__item-count">
            {requestData.numberItems ??
              items.length}{" "}
            món
          </span>
        </div>


        <List
          dataSource={
            items
          }

          locale={{
            emptyText:
              "Chưa có món",
          }}

          renderItem={(
            item,
          ) => {
            const toppingList =
              Array.isArray(
                item.toppings,
              )
                ? item.toppings
                : [];


            return (
              <List.Item className="order-summary-request__dish">
                <div className="order-summary-request__dish-main">
                  <div className="order-summary-request__dish-info">
                    <div className="order-summary-request__dish-name">
                      {item.itemName ||
                        "Sản phẩm"}
                    </div>


                    <span className="order-summary-request__quantity">
                      ×
                      {item.quantity ||
                        1}
                    </span>
                  </div>


                  <div className="order-summary-request__dish-price">
                    {typeof item.price ===
                    "number"
                      ? VND.format(
                          item.price,
                        )
                      : ""}
                  </div>
                </div>


                {toppingList.length >
                  0 && (
                  <div className="order-summary-request__toppings">
                    {toppingList.map(
                      (
                        topping,
                        index,
                      ) => (
                        <span
                          key={
                            topping.toppingId ??
                            `${topping.toppingName}-${index}`
                          }

                          className="order-summary-request__topping"
                        >
                          {
                            topping.toppingName
                          }
                        </span>
                      ),
                    )}
                  </div>
                )}


                {item.note && (
                  <div className="order-summary-request__dish-note">
                    <span>
                      Ghi chú:
                    </span>{" "}
                    {item.note}
                  </div>
                )}
              </List.Item>
            );
          }}
        />
      </div>


      {/* =================================
          Note
      ================================= */}

      <div className="order-summary-request__bottom">
        <div className="order-summary-request__label">
          Ghi chú yêu cầu
        </div>


        <div className="order-summary-request__note-value">
          {requestData.note ||
            "Không có"}
        </div>
      </div>
    </article>
  );
}


OrderSummaryRequestCard.propTypes = {
  data:
    PropTypes.object,
};


OrderSummaryRequestCard.defaultProps = {
  data:
    null,
};


export default OrderSummaryRequestCard;
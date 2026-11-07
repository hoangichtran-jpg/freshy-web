import PropTypes from "prop-types";

import {
  AppstoreOutlined,
  DollarCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import "./SalesSummaryStats.scss";


const formatNumber = (
  value,
) => {
  return Number(
    value ?? 0,
  ).toLocaleString(
    "vi-VN",
  );
};


function SalesSummaryStats({
  totalOrder,
  totalSold,
  totalPrice,
}) {
  const stats = [
    {
      key:
        "orders",

      label:
        "Đơn hàng",

      value:
        formatNumber(
          totalOrder,
        ),

      unit:
        "đơn",

      helper:
        "Trong ca hiện tại",

      icon:
        <ShoppingCartOutlined />,
    },

    {
      key:
        "sold",

      label:
        "Sản lượng bán",

      value:
        formatNumber(
          totalSold,
        ),

      unit:
        "suất",

      helper:
        "Đã bán trong ca",

      icon:
        <AppstoreOutlined />,
    },

    {
      key:
        "revenue",

      label:
        "Doanh thu",

      value:
        formatNumber(
          totalPrice,
        ),

      unit:
        "VNĐ",

      helper:
        "Tổng doanh thu trong ca",

      icon:
        <DollarCircleOutlined />,

      featured:
        true,
    },
  ];


  return (
    <section className="sales-summary-stats">
      {stats.map(
        (stat) => (
          <article
            key={
              stat.key
            }

            className={[
              "sales-summary-stat",

              stat.featured
                ? "sales-summary-stat--featured"
                : "",
            ]
              .filter(
                Boolean,
              )
              .join(" ")}
          >
            <div className="sales-summary-stat__top">
              <span className="sales-summary-stat__label">
                {stat.label}
              </span>

              <span className="sales-summary-stat__icon">
                {stat.icon}
              </span>
            </div>


            <div className="sales-summary-stat__metric">
              <strong className="sales-summary-stat__value">
                {
                  stat.value
                }
              </strong>

              <span className="sales-summary-stat__unit">
                {
                  stat.unit
                }
              </span>
            </div>


            <span className="sales-summary-stat__helper">
              {
                stat.helper
              }
            </span>
          </article>
        ),
      )}
    </section>
  );
}


SalesSummaryStats.propTypes = {
  totalOrder:
    PropTypes.number,

  totalSold:
    PropTypes.number,

  totalPrice:
    PropTypes.number,
};


export default SalesSummaryStats;
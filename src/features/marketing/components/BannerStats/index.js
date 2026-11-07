import React from "react";
import PropTypes from "prop-types";

import "./BannerStats.scss";

function BannerStats({ total, active, inactive }) {
  const items = [
    {
      key: "total",
      label: "Tổng quảng cáo",
      value: total,
      description: "Tất cả banner đã tạo",
    },
    {
      key: "active",
      label: "Đang hiển thị",
      value: active,
      description: "Đang hiển thị tới khách hàng",
    },
    {
      key: "inactive",
      label: "Đang ẩn",
      value: inactive,
      description: "Đang tạm dừng hiển thị",
    },
  ];

  return (
    <section className="banner-stats" aria-label="Tổng quan quảng cáo">
      {items.map((item) => (
        <div
          key={item.key}
          className={[
            "banner-stats__item",
            `banner-stats__item--${item.key}`,
          ].join(" ")}
        >
          <div className="banner-stats__label">
            <span className="banner-stats__dot" aria-hidden="true" />

            <span>{item.label}</span>
          </div>

          <strong className="banner-stats__value">{item.value}</strong>

          <span className="banner-stats__description">{item.description}</span>
        </div>
      ))}
    </section>
  );
}

BannerStats.propTypes = {
  total: PropTypes.number,
  active: PropTypes.number,
  inactive: PropTypes.number,
};

BannerStats.defaultProps = {
  total: 0,
  active: 0,
  inactive: 0,
};

export default BannerStats;

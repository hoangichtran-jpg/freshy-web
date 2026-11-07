import React from "react";

import PropTypes from "prop-types";

import "./ServiceQualityStats.scss";

/* ========================================
   Helpers
======================================== */

const formatAverageScore = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(1);
};

/* ========================================
   Component
======================================== */

function ServiceQualityStats({ total, averageScore, attentionCount }) {
  const items = [
    {
      key: "total",

      label: "Tổng đánh giá",

      value: total,

      suffix: null,

      description: "Phản hồi đã nhận từ khách hàng",
    },

    {
      key: "average",

      label: "Điểm trung bình",

      value: formatAverageScore(averageScore),

      suffix: averageScore === null ? null : "/ 5",

      description: "Điểm trung bình từ các đánh giá hợp lệ",
    },

    {
      key: "attention",

      label: "Cần chú ý",

      value: attentionCount,

      suffix: null,

      description: "Đánh giá từ 1 đến 2 sao",
    },
  ];

  return (
    <section
      className="service-quality-stats"
      aria-label="Tổng quan chất lượng dịch vụ"
    >
      {items.map((item) => (
        <div
          key={item.key}
          className={[
            "service-quality-stats__item",

            `service-quality-stats__item--${item.key}`,
          ].join(" ")}
        >
          <div className="service-quality-stats__label">
            <span className="service-quality-stats__dot" aria-hidden="true" />

            <span>{item.label}</span>
          </div>

          <div className="service-quality-stats__value-row">
            <strong className="service-quality-stats__value">
              {item.value}
            </strong>

            {item.suffix ? (
              <span className="service-quality-stats__suffix">
                {item.suffix}
              </span>
            ) : null}
          </div>

          <span className="service-quality-stats__description">
            {item.description}
          </span>
        </div>
      ))}
    </section>
  );
}

ServiceQualityStats.propTypes = {
  total: PropTypes.number,

  averageScore: PropTypes.number,

  attentionCount: PropTypes.number,
};

ServiceQualityStats.defaultProps = {
  total: 0,

  averageScore: null,

  attentionCount: 0,
};

export default ServiceQualityStats;

import React, { useEffect, useMemo, useState } from "react";

import PropTypes from "prop-types";


import { PictureOutlined, StarFilled } from "@ant-design/icons";

import { formatPhoneNumberWithRegion } from "../../../../helpers";

import ManagementTable from "../../../../shared/components/ManagementTable";

import EmptyState from "../../../../shared/components/EmptyState";

import "./ServiceQualityTable.scss";


/* ========================================
   Constants
======================================== */

const PAGE_SIZE = 10;

/* ========================================
   Helpers
======================================== */

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("vi");

const isValidScore = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 1 &&
  value <= 5;

const getSortableScore = (value) => {
  if (!isValidScore(value)) {
    return 0;
  }

  return value;
};

const getRatingClassName = (score) => {
  if (!isValidScore(score)) {
    return "service-quality-table__rating--unknown";
  }

  if (score <= 2) {
    return "service-quality-table__rating--low";
  }

  if (score === 3) {
    return "service-quality-table__rating--medium";
  }

  return "service-quality-table__rating--good";
};

/* ========================================
   Component
======================================== */

function ServiceQualityTable({
  reviews,

  loading,

  resetPageKey,

  onReviewClick,
}) {
  /* ========================================
     Pagination
  ======================================== */

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () =>
      Math.max(
        1,

        Math.ceil(reviews.length / PAGE_SIZE),
      ),
    [reviews.length],
  );

  /* ========================================
     Reset page when external search changes
  ======================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [resetPageKey]);

  /* ========================================
     Clamp page
  ======================================== */

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  /* ========================================
     Columns
  ======================================== */

  const columns = useMemo(
    () => [
      /* ========================================
           Customer
        ======================================== */

      {
        title: "Khách hàng",

        dataIndex: "customerPhone",

        key: "customerPhone",

        width: 190,

        sorter: (first, second) =>
          normalizeText(first?.customerPhone).localeCompare(
            normalizeText(second?.customerPhone),
            "vi",
          ),

        render: (customerPhone) => {
          const formattedPhone = formatPhoneNumberWithRegion(customerPhone);

          if (!formattedPhone) {
            return (
              <span className="service-quality-table__empty-value">
                Chưa cập nhật
              </span>
            );
          }

          return (
            <span className="service-quality-table__phone">
              {formattedPhone}
            </span>
          );
        },
      },

      /* ========================================
           Rating
        ======================================== */

      {
        title: "Điểm đánh giá",

        dataIndex: "rateScore",

        key: "rateScore",

        width: 180,

        sorter: (first, second) =>
          getSortableScore(first?.rateScore) -
          getSortableScore(second?.rateScore),

        filters: [
          {
            text: "5 sao",

            value: 5,
          },

          {
            text: "4 sao",

            value: 4,
          },

          {
            text: "3 sao",

            value: 3,
          },

          {
            text: "2 sao",

            value: 2,
          },

          {
            text: "1 sao",

            value: 1,
          },
        ],

        filterMultiple: true,

        onFilter: (value, record) => record?.rateScore === Number(value),

        render: (rateScore) => {
          if (!isValidScore(rateScore)) {
            return (
              <span className="service-quality-table__empty-value">
                Không xác định
              </span>
            );
          }

          return (
            <div
              className={[
                "service-quality-table__rating",

                getRatingClassName(rateScore),
              ].join(" ")}
            >
              <StarFilled className="service-quality-table__rating-icon" />

              <strong className="service-quality-table__rating-value">
                {rateScore}
              </strong>

              <span className="service-quality-table__rating-total">/ 5</span>
            </div>
          );
        },
      },

      /* ========================================
           Feedback
        ======================================== */

      {
        title: "Phản hồi",

        dataIndex: "rateNote",

        key: "rateNote",

        render: (rateNote) => {
          const note = String(rateNote || "").trim();

          if (!note) {
            return (
              <span className="service-quality-table__empty-value">
                Chưa có phản hồi
              </span>
            );
          }

          return (
            <span className="service-quality-table__note" title={note}>
              {note}
            </span>
          );
        },
      },

      /* ========================================
           Images
        ======================================== */

      {
        title: "Hình ảnh",

        dataIndex: "imagePaths",

        key: "imagePaths",

        width: 130,

        align: "center",

        render: (imagePaths) => {
          const count = Array.isArray(imagePaths) ? imagePaths.length : 0;

          if (count === 0) {
            return (
              <span className="service-quality-table__empty-value">
                Không có
              </span>
            );
          }

          return (
            <span className="service-quality-table__images">
              <PictureOutlined />

              <strong>{count}</strong>

              <span>ảnh</span>
            </span>
          );
        },
      },
    ],
    [],
  );

  /* ========================================
     Table change
  ======================================== */

  const handleTableChange = (pagination, _filters, _sorter, extra) => {
    if (extra?.action === "filter") {
      setCurrentPage(1);

      return;
    }

    if (pagination?.current) {
      setCurrentPage(pagination.current);
    }
  };

  /* ========================================
     Row interaction
  ======================================== */

  const handleOpenReview = (review) => {
    if (typeof onReviewClick !== "function") {
      return;
    }

    onReviewClick(review);
  };

  const getRowProps = (review) => {
    if (typeof onReviewClick !== "function") {
      return {};
    }

    const customerPhone =
      formatPhoneNumberWithRegion(review?.customerPhone) || "khách hàng";

    return {
      className: "service-quality-table__row",

      tabIndex: 0,

      role: "button",

      "aria-label": `Xem chi tiết đánh giá của ${customerPhone}`,

      onClick: () => {
        handleOpenReview(review);
      },

      onKeyDown: (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        /*
         * Space mặc định scroll page.
         * Row đang đóng vai trò interactive
         * nên prevent default.
         */
        event.preventDefault();

        handleOpenReview(review);
      },
    };
  };

  /* ========================================
     Render
  ======================================== */

  return (
    <ManagementTable
      rowKey="clientKey"
      className="service-quality-table"
      columns={columns}
      dataSource={reviews}
      loading={{
        spinning: loading,

        tip: "Đang tải đánh giá...",
      }}
      scroll={{
        x: 820,
      }}
      pagination={{
        current: currentPage,

        pageSize: PAGE_SIZE,

        showSizeChanger: false,

        hideOnSinglePage: true,

        showTotal: (total) => `${total} đánh giá`,
      }}
      locale={{
        emptyText: (
          <EmptyState
            image="simple"
            description="Không có đánh giá phù hợp"
          />
        ),
      }}
      onChange={handleTableChange}
      onRow={getRowProps}
    />
  );
}

/* ========================================
   PropTypes
======================================== */

ServiceQualityTable.propTypes = {
  reviews: PropTypes.arrayOf(PropTypes.object),

  loading: PropTypes.bool,

  resetPageKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  onReviewClick: PropTypes.func,
};

ServiceQualityTable.defaultProps = {
  reviews: [],

  loading: false,

  resetPageKey: "",

  onReviewClick: undefined,
};

export default ServiceQualityTable;
